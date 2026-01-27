import { DateTime } from 'luxon';
import { Edit2, Trash2, Clock, Calendar, Eye, User as UserIcon } from 'lucide-react';
import { Task, TaskPriority, User } from '../types';
import { PriorityBadge } from './PriorityBadge';

interface TaskCardProps {
    task: Task;
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    users?: User[];
    currentUserId?: number | null;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onView, users, currentUserId }) => {
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return null;
        return DateTime.fromISO(dateString).setLocale('ar').toFormat('dd MMM');
    };

    const getUserName = (userId: number | null | undefined) => {
        if (!userId) return null;
        const user = users?.find(u => u.id === userId);
        return user?.name || 'غير معروف';
    };

    return (
        <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    <h4 className="font-bold text-sm line-clamp-2">{task.title}</h4>
                </div>
                {(onView || onEdit || onDelete) && (
                    <div className="flex gap-1">
                        {onView && (
                            <button
                                onClick={onView}
                                className="text-gray-500 hover:text-blue-600 transition-colors p-1"
                                aria-label="عرض"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        )}
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
                <PriorityBadge priority={task.priority as TaskPriority} />
            </div>

            <div className="flex items-center gap-3 text-xs text-textSecondary dark:text-textSecondary-dark flex-wrap">
                {task.due_date && (
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(task.due_date)}</span>
                    </div>
                )}

                {task.work_hours > 0 && (
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{task.work_hours} ساعة</span>
                    </div>
                )}

                {task.assignee_ids && task.assignee_ids.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {task.assignee_ids.map((assigneeId) => {
                            const isAssigneeCurrentUser = assigneeId === currentUserId;
                            const userName = getUserName(assigneeId);
                            if (!userName) return null;

                            return isAssigneeCurrentUser ? (
                                <div key={assigneeId} className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-full border border-primary/30">
                                    <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center text-primary">
                                        <UserIcon className="w-3 h-3" />
                                    </div>
                                    <span className="text-xs font-semibold text-primary">
                                        {userName}
                                    </span>
                                    <span className="text-[10px] text-primary/70 font-medium">
                                        (أنت)
                                    </span>
                                </div>
                            ) : (
                                <div key={assigneeId} className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-[10px] font-bold">
                                        {userName.charAt(0)}
                                    </div>
                                    <span className="text-xs text-textSecondary dark:text-textSecondary-dark">
                                        {userName}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
