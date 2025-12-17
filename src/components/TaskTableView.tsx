'use client';
import { Task, STATUS_LABELS, PRIORITY_CONFIG, User } from '../types';
import { EmptyState } from './EmptyState';
import { ListTodo, Edit2, Trash2, Eye, Link as LinkIcon } from 'lucide-react';
import { Modal } from './Modal';
import { TaskLinking } from './TaskLinking';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTaskLinks } from '../api/projectApi';
import { fetchTasks } from '../api/mockApi';

interface TaskTableViewProps {
    tasks: Task[];
    users?: User[];
    onEditTask: (task: Task) => void;
    onDeleteTask: (task: Task) => void;
    onViewTask: (task: Task) => void;
    isAdminOrSupervisor: boolean;
    role?: string | null;
    currentUserId?: number | null;
}

export const TaskTableView: React.FC<TaskTableViewProps> = ({
    tasks,
    users,
    onEditTask,
    onDeleteTask,
    onViewTask,
    isAdminOrSupervisor,
    role,
    currentUserId,
}) => {
    const getUserName = (userId: number | null | undefined) => {
        if (!userId) return 'غير مُعين';
        const user = users?.find(u => u.id === userId);
        return user?.name || 'غير معروف';
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (tasks.length === 0) {
        return (
            <EmptyState
                icon={<ListTodo className="w-16 h-16 text-gray-400" />}
                title="لا توجد مهام"
                description="لا توجد مهام في هذا المشروع حاليًا."
            />
        );
    }

    return (
        <div className="card overflow-x-auto">
            <table className="table" aria-label="جدول المهام">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>العنوان</th>
                        <th>المسؤول</th>
                        <th>الحالة</th>
                        <th>الأولوية</th>
                        <th>تاريخ الاستحقاق</th>
                        <th>الإجراءات</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => (
                        <tr key={task.id}>
                            <td>
                                <span className="font-mono text-sm">#{task.id}</span>
                            </td>
                            <td>
                                <span className="font-semibold">{task.title}</span>
                            </td>
                            <td>
                                {task.assignee_id ? (
                                    task.assignee_id === currentUserId ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                                                {getUserName(task.assignee_id).charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-primary">
                                                    {getUserName(task.assignee_id)}
                                                </span>
                                                <span className="text-xs text-primary/70">
                                                    (أنت)
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm">
                                                {getUserName(task.assignee_id).charAt(0)}
                                            </div>
                                            <span className="text-sm">
                                                {getUserName(task.assignee_id)}
                                            </span>
                                        </div>
                                    )
                                ) : (
                                    <span className="text-sm text-gray-400">غير مُعين</span>
                                )}
                            </td>

                            <td>
                                <span className={`badge badge-status-${task.status}`}>
                                    {STATUS_LABELS[task.status]}
                                </span>
                            </td>
                            <td>
                                <span
                                    className={`badge ${PRIORITY_CONFIG[task.priority].bgClass} ${PRIORITY_CONFIG[task.priority].textClass}`}
                                >
                                    {PRIORITY_CONFIG[task.priority].label}
                                </span>
                            </td>
                            <td>
                                <span className="text-sm">
                                    {formatDate(task.due_date)}
                                </span>
                            </td>
                            <td>
                                <div className="flex gap-2 justify-start">
                                    <button
                                        onClick={() => onViewTask(task)}
                                        className="text-sm btn-secondary md:p-3 p-2 flex items-center gap-1"
                                        title="عرض التفاصيل"
                                    >
                                        <Eye className="w-3 h-3" />
                                    </button>
                                    {(role !== 'volunteer' || task.assignee_id === currentUserId) && (
                                        <button
                                            onClick={() => onEditTask(task)}
                                            className="text-sm btn-secondary md:p-3 p-2 flex items-center gap-1"
                                            title="تعديل"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                    )}
                                    {isAdminOrSupervisor && (
                                        <button
                                            onClick={() => onDeleteTask(task)}
                                            className="text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 md:p-3 p-2 rounded-md flex items-center gap-1 transition-colors"
                                            title="حذف"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Task Details Modal Component
interface TaskDetailsModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    users?: User[];
    canLinkTasks?: boolean;
    onViewTask?: (task: Task) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
    task,
    isOpen,
    onClose,
    users,
    canLinkTasks = true,
    onViewTask = () => { },
}) => {
    const [isLinkingOpen, setIsLinkingOpen] = useState(false);

    const { data: allTasks } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => fetchTasks(),
        enabled: !!task,
    });

    const { data: linkedTasks } = useQuery({
        queryKey: ['taskLinks', task?.id],
        queryFn: () => fetchTaskLinks(task!.id),
        enabled: !!task?.id,
    });

    // Get details of linked tasks
    const linkedTaskDetails = linkedTasks?.map(link => {
        const linkedTask = allTasks?.find(t => t.id === link.linked_task_id);
        return { link, task: linkedTask };
    }).filter(item => item.task) || [];

    if (!task) return null;

    const getUserName = (userId: number | null | undefined) => {
        if (!userId) return 'غير مُعين';
        const user = users?.find(u => u.id === userId);
        return user?.name || 'غير معروف';
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="تفاصيل المهمة" size="lg">
            <div className="space-y-4">
                <div>
                    <h3 className="text-2xl font-bold mb-2">{task.title}</h3>
                    <div className="flex gap-2 flex-wrap">
                        <span className={`badge badge-status-${task.status}`}>
                            {STATUS_LABELS[task.status]}
                        </span>
                        <span
                            className={`badge ${PRIORITY_CONFIG[task.priority].bgClass} ${PRIORITY_CONFIG[task.priority].textClass}`}
                        >
                            {PRIORITY_CONFIG[task.priority].label}
                        </span>
                    </div>
                </div>

                {task.description && (
                    <div>
                        <h4 className="font-bold mb-1">الوصف:</h4>
                        <p className="text-textSecondary dark:text-textSecondary-dark">
                            {task.description}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-bold mb-1">المسؤول:</h4>
                        <p className="text-textSecondary dark:text-textSecondary-dark">
                            {getUserName(task.assignee_id)}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-1">ساعات العمل:</h4>
                        <p className="text-textSecondary dark:text-textSecondary-dark">
                            {task.work_hours || 0} ساعة
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-1">تاريخ الإنشاء:</h4>
                        <p className="text-textSecondary dark:text-textSecondary-dark">
                            {formatDate(task.created_at)}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-1">تاريخ الاستحقاق:</h4>
                        <p className="text-textSecondary dark:text-textSecondary-dark">
                            {formatDate(task.due_date)}
                        </p>
                    </div>

                    {task.started_at && (
                        <div>
                            <h4 className="font-bold mb-1">تاريخ البدء:</h4>
                            <p className="text-textSecondary dark:text-textSecondary-dark">
                                {formatDate(task.started_at)}
                            </p>
                        </div>
                    )}

                    {task.completed_at && (
                        <div>
                            <h4 className="font-bold mb-1">تاريخ الإنجاز:</h4>
                            <p className="text-textSecondary dark:text-textSecondary-dark">
                                {formatDate(task.completed_at)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Linked Tasks Section */}
                {linkedTaskDetails.length > 0 && (
                    <div className="border-t pt-4">
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                            <LinkIcon className="w-5 h-5" />
                            المهام المرتبطة ({linkedTaskDetails.length})
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {linkedTaskDetails.map(({ link, task: linkedTask }) => (
                                <button
                                    key={link.id}
                                    onClick={() => {
                                        onClose();
                                        // Open the linked task details
                                        setTimeout(() => onViewTask(linkedTask!), 100);
                                    }}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-right"
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="font-mono text-xs text-gray-500">#{linkedTask!.id}</span>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm">{linkedTask!.title}</p>
                                            <p className="text-xs text-textSecondary dark:text-textSecondary-dark line-clamp-1">
                                                {linkedTask!.description || 'لا يوجد وصف'}
                                            </p>
                                            <div className="flex gap-2 mt-1">
                                                <span className={`badge badge-status-${linkedTask!.status} text-xs`}>
                                                    {STATUS_LABELS[linkedTask!.status]}
                                                </span>
                                                <span className={`badge text-xs ${PRIORITY_CONFIG[linkedTask!.priority].bgClass} ${PRIORITY_CONFIG[linkedTask!.priority].textClass}`}>
                                                    {PRIORITY_CONFIG[linkedTask!.priority].label}
                                                </span>
                                            </div>
                                        </div>
                                        <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-2 justify-start pt-4 border-t">
                    {canLinkTasks && (
                        <button
                            onClick={() => setIsLinkingOpen(true)}
                            className="btn-primary"
                        >
                            ربط المهام
                        </button>
                    )}
                    <button onClick={onClose} className="btn-secondary">
                        إغلاق
                    </button>
                </div>
            </div>

            {/* Task Linking Modal */}
            {isLinkingOpen && task && (
                <TaskLinking
                    task={task}
                    isOpen={isLinkingOpen}
                    onClose={() => setIsLinkingOpen(false)}
                    onViewTask={(viewTask) => {
                        setIsLinkingOpen(false);
                        onClose();
                        setTimeout(() => onViewTask(viewTask), 100);
                    }}
                />
            )}
        </Modal>
    );
};
