import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from './Modal';
import { fetchTasks } from '../api/mockApi';
import { fetchTaskLinks, createTaskLink, deleteTaskLink } from '../api/projectApi';
import { Task } from '../types';
import { Link as LinkIcon, Plus, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface TaskLinkingProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    onViewTask?: (task: Task) => void;
}

export const TaskLinking: React.FC<TaskLinkingProps> = ({ task, isOpen, onClose, onViewTask }) => {
    const queryClient = useQueryClient();
    const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);

    const { data: allTasks } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => fetchTasks(),
    });

    const { data: linkedTasks } = useQuery({
        queryKey: ['taskLinks', task.id],
        queryFn: () => fetchTaskLinks(task.id),
        enabled: !!task.id,
    });

    const createLinkMutation = useMutation({
        mutationFn: (linkedTaskId: number) => createTaskLink(task.id, linkedTaskId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taskLinks', task.id] });
            toast.success('تم ربط المهمة بنجاح');
            setSelectedTaskIds([]);
        },
        onError: (error: any) => {
            toast.error(error.message || 'فشل ربط المهمة');
        },
    });

    const deleteLinkMutation = useMutation({
        mutationFn: deleteTaskLink,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taskLinks', task.id] });
            toast.success('تم إلغاء ربط المهمة بنجاح');
        },
        onError: () => {
            toast.error('فشل إلغاء ربط المهمة');
        },
    });

    // Get available tasks for linking (exclude current task and already linked tasks, only same project)
    const linkedTaskIds = linkedTasks?.map(link => link.linked_task_id) || [];
    const availableTasks = allTasks?.filter(
        t => t.id !== task.id && !linkedTaskIds.includes(t.id) && t.project_id === task.project_id
    ) || [];

    // Get details of linked tasks
    const linkedTaskDetails = linkedTasks?.map(link => {
        const linkedTask = allTasks?.find(t => t.id === link.linked_task_id);
        return { link, task: linkedTask };
    }).filter(item => item.task) || [];

    const handleAddLinks = () => {
        selectedTaskIds.forEach(taskId => {
            createLinkMutation.mutate(taskId);
        });
    };

    const toggleTaskSelection = (taskId: number) => {
        if (selectedTaskIds.includes(taskId)) {
            setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId));
        } else {
            setSelectedTaskIds([...selectedTaskIds, taskId]);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ربط المهام" size="lg">
            <div className="space-y-6">
                {/* Current Linked Tasks */}
                <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <LinkIcon className="w-5 h-5" />
                        المهام المرتبطة ({linkedTaskDetails.length})
                    </h3>
                    {linkedTaskDetails.length > 0 ? (
                        <div className="space-y-2">
                            {linkedTaskDetails.map(({ link, task: linkedTask }) => (
                                <div
                                    key={link.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex-1">
                                        <span className="font-mono text-sm text-gray-500">#{linkedTask!.id}</span>
                                        <p className="font-semibold">{linkedTask!.title}</p>
                                        <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                                            {linkedTask!.description || 'لا يوجد وصف'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {onViewTask && (
                                            <button
                                                onClick={() => {
                                                    onClose();
                                                    setTimeout(() => onViewTask(linkedTask!), 100);
                                                }}
                                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2"
                                                title="عرض التفاصيل"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteLinkMutation.mutate(link.id)}
                                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2"
                                            title="إلغاء الربط"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-textSecondary dark:text-textSecondary-dark text-center py-4">
                            لا توجد مهام مرتبطة بعد
                        </p>
                    )}
                </div>

                {/* Add New Links */}
                <div>
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        إضافة مهام مرتبطة
                    </h3>
                    {availableTasks.length > 0 ? (
                        <>
                            <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                                {availableTasks.map(availableTask => (
                                    <label
                                        key={availableTask.id}
                                        className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedTaskIds.includes(availableTask.id)}
                                            onChange={() => toggleTaskSelection(availableTask.id)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <span className="font-mono text-sm text-gray-500">#{availableTask.id}</span>
                                            <p className="font-semibold">{availableTask.title}</p>
                                            <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                                                {availableTask.description || 'لا يوجد وصف'}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {selectedTaskIds.length > 0 && (
                                <button
                                    onClick={handleAddLinks}
                                    className="btn-primary w-full"
                                    disabled={createLinkMutation.isPending}
                                >
                                    ربط {selectedTaskIds.length} مهمة
                                </button>
                            )}
                        </>
                    ) : (
                        <p className="text-textSecondary dark:text-textSecondary-dark text-center py-4">
                            لا توجد مهام متاحة للربط
                        </p>
                    )}
                </div>

                <div className="flex justify-start pt-4 border-t">
                    <button onClick={onClose} className="btn-secondary">
                        إغلاق
                    </button>
                </div>
            </div>
        </Modal>
    );
};
