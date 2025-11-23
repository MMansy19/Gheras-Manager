'use client';
import { useState, useEffect } from 'react';
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
import { AlertTriangle, Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DatePicker } from '../components/ui/date-picker';
import { Button } from '../components/ui/button';

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
                icon={<AlertTriangle className="w-16 h-16 text-red-500" />}
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
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة مهمة جديدة
                    </button>
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
                <div className="overflow-x-auto -mx-4 px-4">
                    <div className="flex gap-4 min-w-max pb-4">
                        {statuses.map((status) => {
                            const statusTasks = getTasksByStatus(status);
                            return (
                                <div key={status} className="flex flex-col w-72 flex-shrink-0">
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
                role={role}
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
                                className="text-gray-500 hover:text-primary transition-colors p-1"
                                aria-label="تعديل"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className="text-gray-500 hover:text-red-600 transition-colors p-1"
                                aria-label="حذف"
                            >
                                <Trash2 className="w-4 h-4" />
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
                    <Clock className="w-3 h-3" />
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
    role: string | null;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
    isOpen,
    onClose,
    task,
    teamId,
    onSubmit,
    users,
    currentTeam,
    role,
}) => {
    // For volunteers, we simulate getting the current user ID (in a real app, this would come from auth)
    // Using user ID 3 (يوسف علي) as the demo volunteer user
    const currentUserId = role === 'volunteer' ? 3 : null;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'normal' as TaskPriority,
        due_date: '',
        assignee_id: '' as string | number,
        work_hours: 0,
    });

    // Update form data when task prop changes
    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'normal',
                due_date: task.due_date || '',
                assignee_id: task.assignee_id || 'unassigned',
                work_hours: task.work_hours || 0,
            });
        } else {
            // For volunteers creating new tasks, auto-assign to themselves
            setFormData({
                title: '',
                description: '',
                priority: 'normal',
                due_date: '',
                assignee_id: role === 'volunteer' && currentUserId ? currentUserId : 'unassigned',
                work_hours: 0,
            });
        }
    }, [task, isOpen, role, currentUserId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            team_id: teamId,
            assignee_id: formData.assignee_id && formData.assignee_id !== 'unassigned' ? parseInt(formData.assignee_id as any) : null,
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
                <div className="space-y-2">
                    <Label htmlFor="title">عنوان المهمة *</Label>
                    <Input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="أدخل عنوان المهمة"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        placeholder="أدخل وصف المهمة"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="priority">درجة الأهمية</Label>
                        <Select
                            value={formData.priority}
                            onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="اختر درجة الأهمية" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="due_date">تاريخ التسليم</Label>
                        <DatePicker
                            value={formData.due_date || ''}
                            onChange={(date) => setFormData({ ...formData, due_date: date })}
                            placeholder="اختر تاريخ التسليم"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {role === 'volunteer' ? (
                        <div className="space-y-2">
                            <Label htmlFor="assignee_id">تعيين إلى</Label>
                            <Select
                                value={formData.assignee_id?.toString() || ''}
                                disabled
                            >
                                <SelectTrigger className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed">
                                    <SelectValue>
                                        {users?.find(u => u.id === currentUserId)?.name} (أنت)
                                    </SelectValue>
                                </SelectTrigger>
                            </Select>
                            <p className="text-xs text-textSecondary dark:text-textSecondary-dark mt-1">
                                الأعضاء يمكنهم إنشاء مهام لأنفسهم فقط
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="assignee_id">تعيين إلى</Label>
                            <Select
                                value={formData.assignee_id?.toString() || 'unassigned'}
                                onValueChange={(value) => setFormData({ ...formData, assignee_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر المستخدم" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">غير معيّن</SelectItem>
                                    {users?.filter(u => u.status && currentTeam && u.teams.includes(currentTeam.id)).map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.name} ({user.telegram_id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="work_hours">ساعات العمل</Label>
                        <Input
                            id="work_hours"
                            type="number"
                            step="0.5"
                            value={formData.work_hours}
                            onChange={(e) => setFormData({ ...formData, work_hours: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="flex gap-2 justify-start pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        إلغاء
                    </Button>
                    <Button type="submit">
                        {task ? 'حفظ التعديلات' : 'إنشاء المهمة'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
