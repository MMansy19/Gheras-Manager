'use client';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { fetchTeams, fetchTasks, updateTask, createTask, deleteTask, fetchUsers } from '../api/mockApi';
import { Task, TaskStatus, STATUS_LABELS, PRIORITY_LABELS, TaskPriority } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { useRole } from '../hooks/useRole';
import { DateTime } from 'luxon';

export const TeamDashboard = () => {
    const { teamSlug } = useParams<{ teamSlug: string }>();
    const { role } = useRole();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const { data: teams } = useQuery({
        queryKey: ['teams'],
        queryFn: fetchTeams,
    });

    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });

    const currentTeam = teams?.find((t) => t.slug === teamSlug);

    const {
        data: tasks,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['tasks', currentTeam?.id],
        queryFn: () => fetchTasks(currentTeam?.id),
        enabled: !!currentTeam?.id,
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) =>
            updateTask(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ['tasks', currentTeam?.id] });
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks', currentTeam?.id]);

            queryClient.setQueryData<Task[]>(['tasks', currentTeam?.id], (old) =>
                old?.map((task) => (task.id === id ? { ...task, ...data } : task))
            );

            return { previousTasks };
        },
        onError: (_err, _variables, context) => {
            queryClient.setQueryData(['tasks', currentTeam?.id], context?.previousTasks);
            toast.error('فشل تحديث المهمة');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', currentTeam?.id] });
            toast.success('تم تحديث المهمة بنجاح');
        },
    });

    const createTaskMutation = useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', currentTeam?.id] });
            setIsCreateModalOpen(false);
            toast.success('تم إنشاء المهمة بنجاح');
        },
        onError: () => {
            toast.error('فشل إنشاء المهمة');
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', currentTeam?.id] });
            toast.success('تم حذف المهمة بنجاح');
        },
        onError: () => {
            toast.error('فشل حذف المهمة');
        },
    });

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const taskId = parseInt(result.draggableId);
        const newStatus = result.destination.droppableId as TaskStatus;

        updateTaskMutation.mutate({ id: taskId, data: { status: newStatus } });
    };

    const statuses: TaskStatus[] = ['new', 'scheduled', 'in_progress', 'issue', 'done', 'docs'];

    const getTasksByStatus = (status: TaskStatus) => {
        return tasks?.filter((task) => task.status === status) || [];
    };

    const statusColors: Record<TaskStatus, string> = {
        new: 'border-blue-500',
        scheduled: 'border-purple-500',
        in_progress: 'border-amber-500',
        issue: 'border-rose-600',
        done: 'border-green-600',
        docs: 'border-gray-500',
    };

    const isAdminOrSupervisor = role === 'admin' || role === 'supervisor';

    if (isLoading) {
        return <LoadingSpinner message="جاري تحميل المهام..." />;
    }

    if (error) {
        return (
            <EmptyState
                icon="⚠️"
                title="خطأ في تحميل المهام"
                description="حدث خطأ أثناء تحميل المهام. يرجى المحاولة مرة أخرى."
                action={{ label: 'إعادة المحاولة', onClick: () => window.location.reload() }}
            />
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row-reverse items-start sm:items-center justify-between gap-4">
                <div>
                    {isAdminOrSupervisor && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="btn-primary"
                        >
                            ➕ إضافة مهمة جديدة
                        </button>
                    )}
                </div>
                <div>
                    <h1 className="text-3xl font-bold mb-1">{currentTeam?.name}</h1>
                    <p className="text-textSecondary dark:text-textSecondary-dark">
                        إدارة مهام الفريق
                    </p>
                </div>
            </div>

            {/* Kanban Board */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {statuses.map((status) => {
                        const statusTasks = getTasksByStatus(status);
                        return (
                            <div key={status} className="flex flex-col">
                                <div className={`bg-surface dark:bg-surface-dark rounded-t-lg p-3 border-r-4 ${statusColors[status]}`}>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm">{STATUS_LABELS[status]}</span>
                                        <span className="badge bg-gray-200 dark:bg-gray-700">
                                            {statusTasks.length}
                                        </span>
                                    </div>
                                </div>

                                <Droppable droppableId={status}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`bg-gray-50 dark:bg-gray-900 rounded-b-lg p-2 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin ${snapshot.isDraggingOver ? 'bg-gray-100 dark:bg-gray-800' : ''
                                                }`}
                                        >
                                            {statusTasks.length === 0 ? (
                                                <p className="text-center text-textSecondary dark:text-textSecondary-dark text-sm py-8">
                                                    لا توجد مهام
                                                </p>
                                            ) : (
                                                statusTasks.map((task, index) => (
                                                    <Draggable
                                                        key={task.id}
                                                        draggableId={task.id.toString()}
                                                        index={index}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`card mb-2 ${snapshot.isDragging ? 'shadow-2xl rotate-2' : ''
                                                                    }`}
                                                            >
                                                                <TaskCard
                                                                    task={task}
                                                                    onEdit={isAdminOrSupervisor ? () => setEditingTask(task) : undefined}
                                                                    onDelete={isAdminOrSupervisor ? () => deleteTaskMutation.mutate(task.id) : undefined}
                                                                />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            {/* Create/Edit Task Modal */}
            <TaskFormModal
                isOpen={isCreateModalOpen || !!editingTask}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingTask(null);
                }}
                task={editingTask}
                teamId={currentTeam?.id}
                users={users}
                currentTeam={currentTeam}
                onSubmit={(data) => {
                    if (editingTask) {
                        updateTaskMutation.mutate({ id: editingTask.id, data });
                        setEditingTask(null);
                    } else {
                        createTaskMutation.mutate({ ...data, created_by: 1 });
                    }
                }}
            />
        </div>
    );
};

// TaskCard Component
interface TaskCardProps {
    task: Task;
    onEdit?: () => void;
    onDelete?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return null;
        return DateTime.fromISO(dateString).setLocale('ar').toFormat('dd MMM');
    };

    return (
        <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    <h4 className="font-bold text-sm line-clamp-2">{task.title}</h4>
                </div>
                {(onEdit || onDelete) && (
                    <div className="flex gap-1">
                        {onEdit && (
                            <button
                                onClick={onEdit}
                                className="text-gray-500 hover:text-primary transition-colors"
                                aria-label="تعديل"
                            >
                                ✏️
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className="text-gray-500 hover:text-red-600 transition-colors"
                                aria-label="حذف"
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                )}
            </div>

            {task.description && (
                <p className="text-xs text-textSecondary dark:text-textSecondary-dark line-clamp-2">
                    {task.description}
                </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge-priority-${task.priority}`}>
                    {PRIORITY_LABELS[task.priority as TaskPriority]}
                </span>
            </div>

            {task.due_date && (
                <div className="flex items-center gap-1 text-xs text-textSecondary dark:text-textSecondary-dark">
                    <span>📅</span>
                    <span>{formatDate(task.due_date)}</span>
                </div>
            )}

            {task.work_hours > 0 && (
                <div className="flex items-center gap-1 text-xs text-textSecondary dark:text-textSecondary-dark">
                    <span>⏱️</span>
                    <span>{task.work_hours} ساعة</span>
                </div>
            )}

            {task.assignee_id && (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                        {task.assignee_id}
                    </div>
                </div>
            )}
        </div>
    );
};

// TaskFormModal Component
interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    teamId?: number;
    onSubmit: (data: any) => void;
    users?: any[];
    currentTeam?: any;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
    isOpen,
    onClose,
    task,
    teamId,
    onSubmit,
    users,
    currentTeam,
}) => {
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'normal',
        due_date: task?.due_date || '',
        assignee_id: task?.assignee_id || '',
        work_hours: task?.work_hours || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            team_id: teamId,
            assignee_id: formData.assignee_id ? parseInt(formData.assignee_id as any) : null,
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={task ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title">عنوان المهمة *</label>
                    <input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="أدخل عنوان المهمة"
                    />
                </div>

                <div>
                    <label htmlFor="description">الوصف</label>
                    <textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        placeholder="أدخل وصف المهمة"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="priority">درجة الأهمية</label>
                        <select
                            id="priority"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        >
                            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="due_date">تاريخ التسليم</label>
                        <input
                            id="due_date"
                            type="date"
                            value={formData.due_date || ''}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="assignee_id">تعيين إلى</label>
                        <select
                            id="assignee_id"
                            value={formData.assignee_id || ''}
                            onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                        >
                            <option value="">اختر المستخدم</option>
                            {users?.filter(u => u.status && currentTeam && u.teams.includes(currentTeam.id)).map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.telegram_id})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="work_hours">ساعات العمل</label>
                        <input
                            id="work_hours"
                            type="number"
                            step="0.5"
                            value={formData.work_hours}
                            onChange={(e) => setFormData({ ...formData, work_hours: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="flex gap-2 justify-start pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        إلغاء
                    </button>
                    <button type="submit" className="btn-primary">
                        {task ? 'حفظ التعديلات' : 'إنشاء المهمة'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
