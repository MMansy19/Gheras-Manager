'use client';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProjects, createProject, updateProject, deleteProject } from '../api/projectApi';
import { fetchTasks } from '../api/mockApi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useRole } from '../hooks/useRole';
import { useEffect, useState } from 'react';
import { FolderKanban, AlertTriangle, Plus, Edit2, Trash2, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Project, CreateProjectInput, Task, STATUS_LABELS } from '../types';
import toast from 'react-hot-toast';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { PriorityBadge } from '../components/PriorityBadge';

export const Home = () => {
    const navigate = useNavigate();
    const { role } = useRole();
    const queryClient = useQueryClient();
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);

    const toggleProject = (projectId: number) => {
        setExpandedProjectId(prev => prev === projectId ? null : projectId);
    };

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

    const { data: allTasks } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => fetchTasks(),
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

    const activeProjects = projects?.filter(p => p.active);
    const isAdminOrSupervisor = role === 'admin' || role === 'supervisor';

    // Get tasks for a specific project
    const getProjectTasks = (projectId: number): Task[] => {
        return allTasks?.filter(task => task.project_id === projectId) || [];
    };

    // Get task counts by status
    const getTaskCounts = (projectId: number) => {
        const tasks = getProjectTasks(projectId);
        return {
            total: tasks.length,
            done: tasks.filter(t => t.status === 'done').length,
            inProgress: tasks.filter(t => t.status === 'in_progress').length,
            issue: tasks.filter(t => t.status === 'issue').length,
        };
    };

    if (projectsLoading) {
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
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold mb-2 text-primary">المشاريع</h1>
                    <p className="text-lg text-textSecondary dark:text-textSecondary-dark">
                        اختر مشروعًا لعرض وإدارة المهام الخاصة به
                    </p>
                </div>
                {isAdminOrSupervisor && (
                    <button
                        onClick={() => setIsCreateProjectOpen(true)}
                        className="btn-primary flex items-center gap-2 md:mt-auto"
                    >
                        <Plus className="w-5 h-5" />
                        إضافة مشروع جديد
                    </button>
                )}

            </div>
            {/* Projects Grid */}
            {activeProjects && activeProjects.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
                    {activeProjects.map((project) => {
                        const projectTasks = getProjectTasks(project.id);
                        const taskCounts = getTaskCounts(project.id);
                        const isExpanded = expandedProjectId === project.id;

                        return (
                            <div
                                key={project.id}
                                className="card border-2 border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-all"
                            >
                                {/* Project Header - Clickable to expand/collapse */}
                                <div
                                    className="flex items-center justify-between cursor-pointer group"
                                    onClick={() => toggleProject(project.id)}
                                >
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                                            <FolderKanban className="w-8 h-8 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                                {project.name}
                                            </h3>
                                            {project.description && (
                                                <p className="text-textSecondary dark:text-textSecondary-dark text-sm line-clamp-1 mb-2">
                                                    {project.description}
                                                </p>
                                            )}
                                            {/* Task Statistics */}
                                            <div className="flex flex-wrap gap-2 text-xs">
                                                <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    {taskCounts.done} / {taskCounts.total} مكتمل
                                                </span>
                                                {taskCounts.inProgress > 0 && (
                                                    <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">
                                                        <Clock className="w-3 h-3" />
                                                        {taskCounts.inProgress} قيد التنفيذ
                                                    </span>
                                                )}
                                                {taskCounts.issue > 0 && (
                                                    <span className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">
                                                        <AlertCircle className="w-3 h-3" />
                                                        {taskCounts.issue} مشكلة
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center gap-2">
                                        {isAdminOrSupervisor && (
                                            <div className="flex flex-col md:flex-row gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingProject(project);
                                                    }}
                                                    className="text-sm btn-secondary md:p-3 p-2"
                                                    title="تعديل"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setProjectToDelete(project);
                                                    }}
                                                    className="text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 md:p-3 p-2 rounded-md transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Expand/Collapse Icon */}
                                        <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                                            {isExpanded ? (
                                                <ChevronUp className="w-6 h-6 text-primary" />
                                            ) : (
                                                <ChevronDown className="w-6 h-6 text-gray-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tasks List - Collapsible */}
                                {isExpanded && (
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-semibold text-textSecondary dark:text-textSecondary-dark">
                                                    المهام ({projectTasks.length})
                                                </h4>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/app/project/${project.id}`);
                                                    }}
                                                    className="text-sm text-primary hover:underline"
                                                >
                                                    عرض في صفحة المشروع
                                                </button>
                                            </div>
                                            {projectTasks.length > 0 ? (
                                                <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
                                                    {projectTasks.map((task) => (
                                                        <div
                                                            key={task.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/app/project/${project.id}`);
                                                            }}
                                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors group/task"
                                                        >
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <PriorityBadge priority={task.priority} />
                                                                    <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                                                        {STATUS_LABELS[task.status]}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm font-medium truncate group-hover/task:text-primary transition-colors">
                                                                    {task.title}
                                                                </p>
                                                                {task.due_date && (
                                                                    <p className="text-xs text-textSecondary dark:text-textSecondary-dark mt-1">
                                                                        التسليم: {new Date(task.due_date).toLocaleDateString('ar-EG')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-textSecondary dark:text-textSecondary-dark text-center py-4">
                                                    لا توجد مهام في هذا المشروع
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <EmptyState
                    icon={<FolderKanban className="w-16 h-16 text-gray-400" />}
                    title="لا توجد مشاريع"
                    description="لم يتم العثور على مشاريع نشطة."
                />
            )}

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
