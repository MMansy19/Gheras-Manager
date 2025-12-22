'use client';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProjects, createProject, updateProject, deleteProject } from '../api/projectApi';
import { fetchTasks, fetchUsers, updateTask, createTask, deleteTask } from '../api/mockApi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { TaskTableView, TaskDetailsModal } from '../components/TaskTableView';
import { TaskFormModal } from '../components/TaskFormModal';
import { useRole } from '../hooks/useRole';
import { useEffect, useState, useRef } from 'react';
import { FolderKanban, AlertTriangle, Plus, Edit2, Trash2 } from 'lucide-react';
import { Project, CreateProjectInput, Task } from '../types';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';

export const Home = () => {
    const navigate = useNavigate();
    const { role } = useRole();
    const queryClient = useQueryClient();
    const tabsContainerRef = useRef<HTMLDivElement>(null);
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [viewingTask, setViewingTask] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

    // For volunteers, we simulate getting the current user ID
    const currentUserId = role === 'volunteer' ? 3 : null;

    // Redirect to role selection if no role
    useEffect(() => {
        if (!role) {
            navigate('/select-role', { replace: true });
        }
    }, [role, navigate]);

    const { data: projects, isLoading: projectsLoading, error } = useQuery({
        queryKey: ['projects'],
        queryFn: fetchProjects,
    });

    const { data: allTasks, isLoading: tasksLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => fetchTasks(),
    });

    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });

    const createProjectMutation = useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setIsCreateProjectOpen(false);
            toast.success('تم إنشاء المشروع بنجاح');
        },
        onError: () => {
            toast.error('فشل إنشاء المشروع');
        },
    });

    const updateProjectMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Project> }) =>
            updateProject(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setEditingProject(null);
            toast.success('تم تحديث المشروع بنجاح');
        },
        onError: () => {
            toast.error('فشل تحديث المشروع');
        },
    });

    const deleteProjectMutation = useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setProjectToDelete(null);
            toast.success('تم حذف المشروع بنجاح');
        },
        onError: () => {
            toast.error('فشل حذف المشروع');
        },
    });

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
            setIsCreateTaskModalOpen(false);
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

    const activeProjects = projects?.filter(p => p.active);
    const isAdminOrSupervisor = role === 'admin' || role === 'supervisor';

    // Auto-select first project on load
    useEffect(() => {
        if (activeProjects && activeProjects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(activeProjects[0].id);
        }
    }, [activeProjects, selectedProjectId]);

    // Get tasks for a specific project
    const getProjectTasks = (projectId: number): Task[] => {
        return allTasks?.filter(task => task.project_id === projectId) || [];
    };

    const selectedProject = activeProjects?.find(p => p.id === selectedProjectId);
    const projectTasks = selectedProjectId ? getProjectTasks(selectedProjectId) : [];

    if (projectsLoading || tasksLoading) {
        return <LoadingSpinner message="جاري تحميل البيانات..." />;
    }

    if (error) {
        return (
            <EmptyState
                icon={<AlertTriangle className="w-16 h-16 text-red-500" />}
                title="خطأ في تحميل المشاريع"
                description="حدث خطأ أثناء تحميل المشاريع. يرجى المحاولة مرة أخرى."
                action={{ label: 'إعادة المحاولة', onClick: () => window.location.reload() }}
            />
        );
    }

    return (
        <div className="min-h-screen">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row-reverse items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex gap-2">
                        {isAdminOrSupervisor && (
                            <>
                                <button
                                    onClick={() => setIsCreateProjectOpen(true)}
                                    className="btn-secondary flex items-center gap-2"
                                    title="إضافة مشروع جديد"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="text-sm sm:text-md">مشروع جديد</span>
                                </button>
                                {selectedProjectId && (
                                    <button
                                        onClick={() => setIsCreateTaskModalOpen(true)}
                                        className="btn-primary flex items-center gap-2"
                                        title="إضافة مهمة جديدة"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span className="text-sm sm:text-md">مهمة جديدة</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold mb-2 text-primary">المشاريع والمهام</h1>
                        <p className="text-textSecondary dark:text-textSecondary-dark">
                            اختر مشروعًا لعرض وإدارة المهام الخاصة به
                        </p>
                    </div>
                </div>

                {/* Projects Tabs Section */}
                {activeProjects && activeProjects.length > 0 ? (
                    <div className="relative">
                        {/* Tabs Container */}
                        <div
                            ref={tabsContainerRef}
                            className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 px-8"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {activeProjects.map((project) => {
                                const isActive = selectedProjectId === project.id;
                                const taskCount = getProjectTasks(project.id).length;

                                return (
                                    <button
                                        key={project.id}
                                        onClick={() => setSelectedProjectId(project.id)}
                                        className={`
                                            group relative flex-shrink-0 px-6 py-4 rounded-lg transition-all duration-200
                                            ${isActive
                                                ? 'bg-primary text-white shadow-lg scale-105'
                                                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md hover:shadow-lg'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <FolderKanban className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-primary'}`} />
                                            <div className="text-right min-w-0">
                                                <div className={`font-semibold whitespace-nowrap ${isActive ? 'text-white' : 'text-textPrimary dark:text-textPrimary-dark'}`}>
                                                    {project.name}
                                                </div>
                                                <div className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-textSecondary dark:text-textSecondary-dark'}`}>
                                                    {taskCount} مهمة
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <EmptyState
                        icon={<FolderKanban className="w-16 h-16 text-gray-400" />}
                        title="لا توجد مشاريع"
                        description="لم يتم العثور على مشاريع نشطة."
                        action={isAdminOrSupervisor ? {
                            label: 'إضافة مشروع جديد',
                            onClick: () => setIsCreateProjectOpen(true)
                        } : undefined}
                    />
                )}
            </div>

            {/* Tasks Section */}
            {selectedProject && (
                <div className="space-y-6">
                    {/* Project Info Banner */}
                    <div className="card bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-2 border-primary/20">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-2">{selectedProject.name}</h2>
                                {selectedProject.description && (
                                    <p className="text-textSecondary dark:text-textSecondary-dark">
                                        {selectedProject.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-start gap-4">
                                {isAdminOrSupervisor && (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <button
                                            onClick={() => setEditingProject(selectedProject)}
                                            className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
                                            title="تعديل المشروع"
                                        >
                                            <Edit2 className="w-4 h-4 text-textPrimary dark:text-textPrimary-dark" />
                                        </button>
                                        <button
                                            onClick={() => setProjectToDelete(selectedProject)}
                                            className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shadow-sm"
                                            title="حذف المشروع"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        </button>
                                    </div>
                                )}
                                <div className="text-left hidden sm:block">
                                    <div className="text-3xl font-bold text-primary">{projectTasks.length}</div>
                                    <div className="text-sm text-textSecondary dark:text-textSecondary-dark">مهمة</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tasks Table */}
                    <div className="card">
                        <TaskTableView
                            tasks={projectTasks}
                            users={users}
                            onEditTask={setEditingTask}
                            onDeleteTask={setTaskToDelete}
                            onViewTask={setViewingTask}
                            isAdminOrSupervisor={isAdminOrSupervisor}
                            role={role}
                            currentUserId={currentUserId}
                        />
                    </div>
                </div>
            )}

            {/* Modals */}
            {/* Create/Edit Project Modal */}
            <ProjectFormModal
                isOpen={isCreateProjectOpen || !!editingProject}
                onClose={() => {
                    setIsCreateProjectOpen(false);
                    setEditingProject(null);
                }}
                project={editingProject}
                onSubmit={(data) => {
                    if (editingProject) {
                        updateProjectMutation.mutate({ id: editingProject.id, data });
                    } else {
                        createProjectMutation.mutate({ ...data, created_by: 1 });
                    }
                }}
            />

            {/* Create/Edit Task Modal */}
            {selectedProjectId && (
                <TaskFormModal
                    isOpen={isCreateTaskModalOpen || !!editingTask}
                    onClose={() => {
                        setIsCreateTaskModalOpen(false);
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
                                project_id: selectedProjectId
                            });
                        }
                    }}
                />
            )}

            {/* Task Details Modal */}
            <TaskDetailsModal
                task={viewingTask}
                isOpen={!!viewingTask}
                onClose={() => setViewingTask(null)}
                users={users}
                canLinkTasks={true}
                onViewTask={setViewingTask}
            />

            {/* Delete Project Confirmation */}
            <ConfirmDialog
                isOpen={!!projectToDelete}
                onClose={() => setProjectToDelete(null)}
                onConfirm={() => {
                    if (projectToDelete) {
                        deleteProjectMutation.mutate(projectToDelete.id);
                    }
                }}
                title="تأكيد حذف المشروع"
                message={`هل أنت متأكد من حذف المشروع "${projectToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                confirmText="حذف"
                cancelText="إلغاء"
            />

            {/* Delete Task Confirmation */}
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

// Project Form Modal Component
interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
    onSubmit: (data: CreateProjectInput) => void;
}

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
    isOpen,
    onClose,
    project,
    onSubmit,
}) => {
    const [formData, setFormData] = useState<CreateProjectInput>({
        name: '',
        description: '',
    });

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name,
                description: project.description || '',
            });
        } else {
            setFormData({
                name: '',
                description: '',
            });
        }
    }, [project, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('يجب إدخال اسم المشروع');
            return;
        }
        onSubmit(formData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={project ? 'تعديل المشروع' : 'إضافة مشروع جديد'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">اسم المشروع *</Label>
                    <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="أدخل اسم المشروع"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="أدخل وصف المشروع"
                        className="input min-h-[100px]"
                        rows={4}
                    />
                </div>

                <div className="flex gap-2 justify-start pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        إلغاء
                    </Button>
                    <Button type="submit">
                        {project ? 'حفظ التعديلات' : 'إنشاء المشروع'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
