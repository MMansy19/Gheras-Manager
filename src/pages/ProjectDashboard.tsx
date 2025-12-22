'use client';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DropResult } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { fetchProjectById } from '../api/projectApi';
import { fetchTasks, updateTask, createTask, deleteTask, fetchUsers } from '../api/mockApi';
import { Task, TaskStatus } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { KanbanBoard } from '../components/KanbanBoard';
import { TaskTableView, TaskDetailsModal } from '../components/TaskTableView';
import { TaskFormModal } from '../components/TaskFormModal';
import { TaskLinking } from '../components/TaskLinking';
import { useRole } from '../hooks/useRole';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SearchableSelect, SearchableSelectContent, SearchableSelectItem, SearchableSelectTrigger, SearchableSelectValue } from '../components/ui/searchable-select';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { AlertTriangle, Plus, LayoutGrid, List, Search } from 'lucide-react';

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

    // For volunteers, we simulate getting the current user ID (in a real app, this would come from auth)
    const currentUserId = role === 'volunteer' ? 3 : null;

    // Filter states
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [filterAssignee, setFilterAssignee] = useState<string>('all');
    const [filterMinHours, setFilterMinHours] = useState<string>('');
    const [filterMaxHours, setFilterMaxHours] = useState<string>('');
    const [assigneeSearch, setAssigneeSearch] = useState('');

    const { data: project, isLoading: projectLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => fetchProjectById(Number(projectId)),
        enabled: !!projectId,
    });

    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
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

        // Apply search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query)
            );
        }

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
        setSearchQuery('');
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
            <div className="md:mb-6 mb-2">
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
                {/* Search Bar - Always visible */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="ابحث عن مهمة بالعنوان أو الوصف..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-10"
                        />
                    </div>
                </div>

                {/* Mobile Toggle Button */}
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="lg:hidden w-full flex items-center justify-between mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <span className="font-semibold">الفلاتر المتقدمة</span>
                    <svg
                        className={`w-5 h-5 transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Filters - Always visible on desktop, toggleable on mobile */}
                <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>الحالة</Label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر الحالة" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">الكل</SelectItem>
                                    <SelectItem value="new">جديد</SelectItem>
                                    <SelectItem value="scheduled">مجدول</SelectItem>
                                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                                    <SelectItem value="issue">مشكلة</SelectItem>
                                    <SelectItem value="done">تم التنفيذ</SelectItem>
                                    <SelectItem value="docs">وثائق</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>الأولوية</Label>
                            <Select value={filterPriority} onValueChange={setFilterPriority}>
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر الأولوية" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">الكل</SelectItem>
                                    <SelectItem value="very_urgent">عاجلة جدًا</SelectItem>
                                    <SelectItem value="urgent">عاجلة</SelectItem>
                                    <SelectItem value="medium">متوسطة</SelectItem>
                                    <SelectItem value="normal">عادية</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>المسؤول</Label>
                            <SearchableSelect value={filterAssignee} onValueChange={setFilterAssignee}>
                                <SearchableSelectTrigger>
                                    <SearchableSelectValue placeholder="اختر المسؤول" />
                                </SearchableSelectTrigger>
                                <SearchableSelectContent
                                    onSearchChange={setAssigneeSearch}
                                    searchPlaceholder="ابحث عن مستخدم..."
                                >
                                    <SearchableSelectItem value="all">الكل</SearchableSelectItem>
                                    <SearchableSelectItem value="unassigned">غير مُعين</SearchableSelectItem>
                                    {users
                                        ?.filter(u => u.status && u)
                                        .filter(user =>
                                            assigneeSearch === '' ||
                                            user.name.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
                                            user.telegram_id?.toLowerCase().includes(assigneeSearch.toLowerCase())
                                        )
                                        .map((user) => (
                                            <SearchableSelectItem key={user.id} value={user.id.toString()}>
                                                {user.name} ({user.telegram_id})
                                            </SearchableSelectItem>
                                        ))}
                                </SearchableSelectContent>
                            </SearchableSelect>
                        </div>

                        <div className="md:col-span-3 flex gap-2">
                            {(filterStatus !== 'all' || filterPriority !== 'all' || filterAssignee !== 'all' || filterMinHours || filterMaxHours) && (
                                <button onClick={handleClearFilters} className="btn-secondary text-sm">
                                    مسح الفلاتر
                                </button>
                            )}
                        </div>
                    </div>
                </div>
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
                    currentUserId={currentUserId}
                    users={users}
                />
            ) : (
                <TaskTableView
                    tasks={filteredTasks}
                    users={users}
                    onEditTask={setEditingTask}
                    onDeleteTask={setTaskToDelete}
                    onViewTask={setViewingTask}
                    isAdminOrSupervisor={isAdminOrSupervisor}
                    role={role}
                    currentUserId={currentUserId}
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
                users={users}
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
