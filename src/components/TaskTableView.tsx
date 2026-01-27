'use client';
import { Task, STATUS_LABELS, PRIORITY_CONFIG, User } from '../types';
import { EmptyState } from './EmptyState';
import { ListTodo, Edit2, Trash2, Eye, Link as LinkIcon, MoreHorizontal } from 'lucide-react';
import { Modal } from './Modal';
import { TaskLinking } from './TaskLinking';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTaskLinks } from '../api/projectApi';
import { fetchTasks } from '../api/mockApi';
import { 
    Table, 
    TableHeader, 
    TableBody, 
    TableRow, 
    TableHead, 
    TableCell,
    TableAvatar,
    TableBadge
} from './ui/table';

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
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

    const handleMenuToggle = (taskId: number, event: React.MouseEvent<HTMLButtonElement>) => {
        if (openMenuId === taskId) {
            setOpenMenuId(null);
            setMenuPosition(null);
            return;
        }

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const menuHeight = 120;

        // Calculate position for fixed overlay
        const top = spaceBelow < menuHeight ? rect.top - menuHeight : rect.bottom;
        const left = rect.left;

        setMenuPosition({ top, left });
        setOpenMenuId(taskId);
    };

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
        <Table>
            <TableHeader>
                <TableRow hoverable={false}>
                    <TableHead className="min-w-[60px] md:min-w-[80px]">ID</TableHead>
                    <TableHead className="min-w-[150px] md:min-w-[200px]">العنوان</TableHead>
                    <TableHead className="min-w-[120px] md:min-w-[180px]">المسؤول</TableHead>
                    <TableHead className="min-w-[100px] md:min-w-[120px]">الحالة</TableHead>
                    <TableHead className="min-w-[100px] md:min-w-[120px]">الأولوية</TableHead>
                    <TableHead className="min-w-[120px] md:min-w-[150px]">تاريخ الاستحقاق</TableHead>
                    <TableHead className="min-w-[120px] md:min-w-[150px]">الإجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tasks.map((task) => (
                    <TableRow
                        key={task.id}
                        onClick={() => onViewTask(task)}
                        clickable
                    >
                        <TableCell className="min-w-[60px] md:min-w-[80px]">
                            <span className="font-mono text-sm">#{task.id}</span>
                        </TableCell>
                        <TableCell className="min-w-[150px] md:min-w-[200px]">
                            <span className="font-semibold">{task.title}</span>
                        </TableCell>
                        <TableCell className="min-w-[120px] md:min-w-[180px]">
                            {task.assignee_ids && task.assignee_ids.length > 0 ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                    {task.assignee_ids.map((assigneeId) => (
                                        <TableAvatar
                                            key={assigneeId}
                                            name={getUserName(assigneeId)}
                                            highlight={assigneeId === currentUserId}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400">غير مُعين</span>
                            )}
                        </TableCell>

                        <TableCell className="min-w-[100px] md:min-w-[120px]">
                            <span className={`badge badge-status-${task.status}`}>
                                {STATUS_LABELS[task.status]}
                            </span>
                        </TableCell>
                        <TableCell className="min-w-[100px] md:min-w-[120px]">
                            <span
                                className={`badge ${PRIORITY_CONFIG[task.priority].bgClass} ${PRIORITY_CONFIG[task.priority].textClass}`}
                            >
                                {PRIORITY_CONFIG[task.priority].label}
                            </span>
                        </TableCell>
                        <TableCell className="min-w-[120px] md:min-w-[150px]">
                            <span className="text-sm">
                                {formatDate(task.due_date)}
                            </span>
                        </TableCell>
                        <TableCell className="min-w-[120px] md:min-w-[150px]">
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={(e) => handleMenuToggle(task.id, e)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                                    title="الإجراءات"
                                >
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>

            {/* Global Dropdown Menu Overlay */}
            {openMenuId !== null && menuPosition && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => {
                            setOpenMenuId(null);
                            setMenuPosition(null);
                        }}
                    />

                    {/* Dropdown Menu */}
                    <div
                        className="fixed w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[101] py-1"
                        style={{
                            top: `${menuPosition.top}px`,
                            left: `${menuPosition.left}px`,
                        }}
                    >
                        <button
                            onClick={() => {
                                const task = tasks.find(t => t.id === openMenuId);
                                if (task) onViewTask(task);
                                setOpenMenuId(null);
                                setMenuPosition(null);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-textPrimary dark:text-textPrimary-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-right"
                        >
                            <Eye className="w-4 h-4" />
                            <span>عرض التفاصيل</span>
                        </button>

                        {(() => {
                            const task = tasks.find(t => t.id === openMenuId);
                            return (role !== 'volunteer' || task?.assignee_ids?.includes(currentUserId!)) && (
                                <button
                                    onClick={() => {
                                        if (task) onEditTask(task);
                                        setOpenMenuId(null);
                                        setMenuPosition(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-textPrimary dark:text-textPrimary-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-right"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    <span>تعديل</span>
                                </button>
                            );
                        })()}

                        {isAdminOrSupervisor && (() => {
                            const task = tasks.find(t => t.id === openMenuId);
                            return (
                                <button
                                    onClick={() => {
                                        if (task) onDeleteTask(task);
                                        setOpenMenuId(null);
                                        setMenuPosition(null);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-right"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>حذف</span>
                                </button>
                            );
                        })()}
                    </div>
                </>
            )}
        </Table>
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
    currentUserId?: number | null;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
    task,
    isOpen,
    onClose,
    users,
    canLinkTasks = true,
    onViewTask = () => { },
    currentUserId,
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
                        <h4 className="font-bold mb-1">المسؤولون:</h4>
                        <div className="flex flex-wrap gap-2">
                            {task.assignee_ids && task.assignee_ids.length > 0 ? (
                                task.assignee_ids.map((assigneeId) => (
                                    <span
                                        key={assigneeId}
                                        className={`px-2 py-1 rounded-full text-xs ${
                                            assigneeId === currentUserId
                                                ? 'bg-primary/10 text-primary border border-primary/30'
                                                : 'bg-gray-100 dark:bg-gray-700 text-textSecondary dark:text-textSecondary-dark'
                                        }`}
                                    >
                                        {getUserName(assigneeId)}
                                        {assigneeId === currentUserId && ' (أنت)'}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-gray-400">غير مُعين</span>
                            )}
                        </div>
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
                                                <TableBadge variant={linkedTask!.status === 'done' ? 'success' : linkedTask!.status === 'in_progress' ? 'info' : 'default'}>
                                                    {STATUS_LABELS[linkedTask!.status]}
                                                </TableBadge>
                                                <TableBadge variant={linkedTask!.priority === 'very_urgent' || linkedTask!.priority === 'urgent' ? 'danger' : linkedTask!.priority === 'medium' ? 'warning' : 'default'}>
                                                    {PRIORITY_CONFIG[linkedTask!.priority].label}
                                                </TableBadge>
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
