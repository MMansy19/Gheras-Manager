'use client';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DropResult } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { fetchProjectById } from '../api/projectApi';
import { fetchTasks, updateTask, createTask, deleteTask, fetchUsers, fetchTeams } from '../api/mockApi';
import { Task, TaskStatus } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { KanbanBoard } from '../components/KanbanBoard';
import { TaskTableView, TaskDetailsModal } from '../components/TaskTableView';
import { TaskFormModal } from '../components/TaskFormModal';
import { TaskLinking } from '../components/TaskLinking';
import { useRole } from '../hooks/useRole';
import { AlertTriangle, Plus, LayoutGrid, List } from 'lucide-react';

export const ProjectDashboard = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { role } = useRole();
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [viewingTask, setViewingTask] = useState<Task | null>(null);
    const [linkingTask, setLinkingTask] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

    // Filter states
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [filterAssignee, setFilterAssignee] = useState<string>('all');
    const [filterMinHours, setFilterMinHours] = useState<string>('');
    const [filterMaxHours, setFilterMaxHours] = useState<string>('');

    const { data: project, isLoading: projectLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => fetchProjectById(Number(projectId)),
        enabled: !!projectId,
    });

    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });

    const { data: teams } = useQuery({
        queryKey: ['teams'],
        queryFn: fetchTeams,
    });

    const {
        data: allTasks,
        isLoading: tasksLoading,
        error,
    } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => fetchTasks(),
        enabled: !!projectId,
    });

    // Filter tasks by project
    const projectTasks = allTasks?.filter(task => task.project_id === Number(projectId)) || [];

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) =>
            updateTask(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] });
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

            queryClient.setQueryData<Task[]>(['tasks'], (old) =>
                old?.map((task) => (task.id === id ? { ...task, ...data } : task))
            );

            return { previousTasks };
        },
        onError: (_err, _variables, context) => {
            queryClient.setQueryData(['tasks'], context?.previousTasks);
            toast.error('فشل تحديث المهمة');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success('تم تحديث المهمة بنجاح');
        },
    });

    const createTaskMutation = useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
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

    const applyFilters = (tasks: Task[]) => {
        let filtered = [...tasks];

        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(task => task.status === filterStatus);
        }

        // Apply priority filter
        if (filterPriority !== 'all') {
            filtered = filtered.filter(task => task.priority === filterPriority);
        }

        // Apply assignee filter
        if (filterAssignee !== 'all') {
            if (filterAssignee === 'unassigned') {
                filtered = filtered.filter(task => !task.assignee_id);
            } else {
                filtered = filtered.filter(task => task.assignee_id?.toString() === filterAssignee);
            }
        }

        // Apply work hours filter
        if (filterMinHours) {
            filtered = filtered.filter(task => task.work_hours >= parseFloat(filterMinHours));
        }
        if (filterMaxHours) {
            filtered = filtered.filter(task => task.work_hours <= parseFloat(filterMaxHours));
        }

        return filtered;
    };

    const getTasksByStatus = (status: TaskStatus) => {
        const filtered = applyFilters(projectTasks);
        return filtered.filter((task) => task.status === status);
    };

    const handleClearFilters = () => {
        setFilterStatus('all');
        setFilterPriority('all');
        setFilterAssignee('all');
        setFilterMinHours('');
        setFilterMaxHours('');
    };

    const statuses: TaskStatus[] = ['new', 'scheduled', 'in_progress', 'issue', 'done', 'docs'];
    const isAdminOrSupervisor = role === 'admin' || role === 'supervisor';

    if (projectLoading || tasksLoading) {
        return <LoadingSpinner message="جاري تحميل المشروع..." />;
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

    if (!project) {
        return (
            <EmptyState
                icon={<AlertTriangle className="w-16 h-16 text-red-500" />}
                title="المشروع غير موجود"
                description="لم يتم العثور على المشروع المطلوب."
            />
        );
    }

    const filteredTasks = applyFilters(projectTasks);

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row-reverse items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            إضافة مهمة جديدة
                        </button>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
                        {project.description && (
                            <p className="text-textSecondary dark:text-textSecondary-dark">
                                {project.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${viewMode === 'kanban'
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-textPrimary dark:text-textPrimary-dark'
                            }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        عرض كانبان
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${viewMode === 'table'
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-textPrimary dark:text-textPrimary-dark'
                            }`}
                    >
                        <List className="w-4 h-4" />
                        عرض جدول
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">التصفية</h3>
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="text-sm text-primary hover:underline"
                    >
                        {isFilterOpen ? 'إخفاء' : 'إظهار'} الفلاتر
                    </button>
                </div>

                {isFilterOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">الحالة</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="input"
                            >
                                <option value="all">الكل</option>
                                <option value="new">جديد</option>
                                <option value="scheduled">مجدول</option>
                                <option value="in_progress">قيد التنفيذ</option>
                                <option value="issue">مشكلة</option>
                                <option value="done">تم التنفيذ</option>
                                <option value="docs">وثائق</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">الأولوية</label>
                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="input"
                            >
                                <option value="all">الكل</option>
                                <option value="very_urgent">عاجلة جدًا</option>
                                <option value="urgent">عاجلة</option>
                                <option value="medium">متوسطة</option>
                                <option value="normal">عادية</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">المسؤول</label>
                            <select
                                value={filterAssignee}
                                onChange={(e) => setFilterAssignee(e.target.value)}
                                className="input"
                            >
                                <option value="all">الكل</option>
                                <option value="unassigned">غير مُعين</option>
                                {users?.map((user) => (
                                    <option key={user.id} value={user.id.toString()}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-3 flex gap-2">
                            <button onClick={handleClearFilters} className="btn-secondary text-sm">
                                مسح الفلاتر
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Content */}
            {viewMode === 'kanban' ? (
                <KanbanBoard
                    statuses={statuses}
                    getTasksByStatus={getTasksByStatus}
                    onDragEnd={handleDragEnd}
                    onViewTask={setViewingTask}
                    onEditTask={setEditingTask}
                    onDeleteTask={setTaskToDelete}
                    isAdminOrSupervisor={isAdminOrSupervisor}
                    role={role}
                />
            ) : (
                <TaskTableView
                    tasks={filteredTasks}
                    users={users}
                    onEditTask={setEditingTask}
                    onDeleteTask={setTaskToDelete}
                    onViewTask={setViewingTask}
                    isAdminOrSupervisor={isAdminOrSupervisor}
                />
            )}

            {/* Create/Edit Task Modal */}
            <TaskFormModal
                isOpen={isCreateModalOpen || !!editingTask}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingTask(null);
                }}
                task={editingTask}
                teamId={project.team_id || undefined}
                users={users}
                currentTeam={teams?.find(t => t.id === project.team_id)}
                role={role}
                onSubmit={(data) => {
                    if (editingTask) {
                        updateTaskMutation.mutate({ id: editingTask.id, data });
                        setEditingTask(null);
                    } else {
                        createTaskMutation.mutate({
                            ...data,
                            created_by: 1,
                            project_id: Number(projectId)
                        });
                    }
                }}
            />

            {/* Task Details Modal */}
            <TaskDetailsModal
                task={viewingTask}
                isOpen={!!viewingTask}
                onClose={() => setViewingTask(null)}
                users={users}
                canLinkTasks={true}
                onViewTask={setViewingTask}
            />

            {/* Task Linking Modal */}
            {linkingTask && (
                <TaskLinking
                    task={linkingTask}
                    isOpen={!!linkingTask}
                    onClose={() => setLinkingTask(null)}
                    onViewTask={(task) => {
                        setLinkingTask(null);
                        setViewingTask(task);
                    }}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!taskToDelete}
                onClose={() => setTaskToDelete(null)}
                onConfirm={() => {
                    if (taskToDelete) {
                        deleteTaskMutation.mutate(taskToDelete.id);
                        setTaskToDelete(null);
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
