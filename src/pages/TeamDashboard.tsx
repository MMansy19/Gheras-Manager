'use client';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DropResult } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { fetchTeams, fetchTasks, updateTask, createTask, deleteTask, fetchUsers } from '../api/mockApi';
import { Task, TaskStatus } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TaskFilters } from '../components/TaskFilters';
import { KanbanBoard } from '../components/KanbanBoard';
import { TaskFormModal } from '../components/TaskFormModal';
import { useRole } from '../hooks/useRole';
import { AlertTriangle, Plus } from 'lucide-react';

export const TeamDashboard = () => {
    const { teamSlug } = useParams<{ teamSlug: string }>();
    const { role } = useRole();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    // Filter states
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [filterAssignee, setFilterAssignee] = useState<string>('all');
    const [filterMinHours, setFilterMinHours] = useState<string>('');
    const [filterMaxHours, setFilterMaxHours] = useState<string>('');

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

    const getTasksByStatus = (status: TaskStatus) => {
        let filteredTasks = tasks?.filter((task) => task.status === status) || [];

        // Apply priority filter
        if (filterPriority !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === filterPriority);
        }

        // Apply assignee filter
        if (filterAssignee !== 'all') {
            if (filterAssignee === 'unassigned') {
                filteredTasks = filteredTasks.filter(task => !task.assignee_id);
            } else {
                filteredTasks = filteredTasks.filter(task => task.assignee_id?.toString() === filterAssignee);
            }
        }

        // Apply work hours filter
        if (filterMinHours) {
            filteredTasks = filteredTasks.filter(task => task.work_hours >= parseFloat(filterMinHours));
        }
        if (filterMaxHours) {
            filteredTasks = filteredTasks.filter(task => task.work_hours <= parseFloat(filterMaxHours));
        }

        return filteredTasks;
    };

    const handleClearFilters = () => {
        setFilterPriority('all');
        setFilterAssignee('all');
        setFilterMinHours('');
        setFilterMaxHours('');
    };

    const statuses: TaskStatus[] = ['new', 'scheduled', 'in_progress', 'issue', 'done', 'docs'];
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
                    {/* All roles can create tasks, but volunteers can only assign to themselves */}
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

            {/* Filters */}
            <TaskFilters
                isOpen={isFilterOpen}
                onToggle={() => setIsFilterOpen(!isFilterOpen)}
                filterPriority={filterPriority}
                setFilterPriority={setFilterPriority}
                filterAssignee={filterAssignee}
                setFilterAssignee={setFilterAssignee}
                filterMinHours={filterMinHours}
                setFilterMinHours={setFilterMinHours}
                filterMaxHours={filterMaxHours}
                setFilterMaxHours={setFilterMaxHours}
                users={users}
                currentTeam={currentTeam}
                onClearFilters={handleClearFilters}
            />

            {/* Kanban Board */}
            <KanbanBoard
                statuses={statuses}
                getTasksByStatus={getTasksByStatus}
                onDragEnd={handleDragEnd}
                onEditTask={setEditingTask}
                onDeleteTask={setTaskToDelete}
                isAdminOrSupervisor={isAdminOrSupervisor}
            />

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

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!taskToDelete}
                onClose={() => setTaskToDelete(null)}
                onConfirm={() => {
                    if (taskToDelete) {
                        deleteTaskMutation.mutate(taskToDelete.id);
                    }
                }}
                title="تأكيد حذف المهمة"
                message={`هل أنت متأكد من حذف المهمة "${taskToDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                confirmText="حذف"
                cancelText="إلغاء"
            />
        </div>
    );
};
