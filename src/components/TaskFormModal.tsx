import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePicker } from './ui/date-picker';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Task, TaskPriority, TaskStatus, PRIORITY_CONFIG, STATUS_LABELS } from '../types';
import { PriorityBadge } from './PriorityBadge';

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onSubmit: (data: any) => void;
    users?: any[];
    role: string | null;
    teamId?: number;
    currentTeam?: any;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
    isOpen,
    onClose,
    task,
    onSubmit,
    users,
    role,
}) => {
    // For volunteers, we simulate getting the current user ID (in a real app, this would come from auth)
    // Using user ID 3 (يوسف علي) as the demo volunteer user
    const currentUserId = role === 'volunteer' ? 3 : null;

    // Check if volunteer is editing their own task (can only update status and work_hours)
    const isVolunteerEditing = role === 'volunteer' && task !== null && task.assignee_ids?.includes(currentUserId!);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'new' as TaskStatus,
        priority: 'normal' as TaskPriority,
        due_date: '',
        assignee_ids: [] as number[],
        work_hours: 0,
    });

    const [userSearch, setUserSearch] = useState('');

    // Update form data when task prop changes
    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                status: task.status || 'new',
                priority: task.priority || 'normal',
                due_date: task.due_date || '',
                assignee_ids: task.assignee_ids || [],
                work_hours: task.work_hours || 0,
            });
        } else {
            // For volunteers creating new tasks, auto-assign to themselves
            setFormData({
                title: '',
                description: '',
                status: 'new',
                priority: 'normal',
                due_date: '',
                assignee_ids: role === 'volunteer' && currentUserId ? [currentUserId] : [],
                work_hours: 0,
            });
        }
    }, [task, isOpen, role, currentUserId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // If volunteer is editing, only submit status and work_hours
        if (isVolunteerEditing) {
            onSubmit({
                status: formData.status,
                work_hours: formData.work_hours,
            });
        } else {
            onSubmit({
                ...formData,
                assignee_ids: formData.assignee_ids,
            });
        }
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={task ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {isVolunteerEditing && (
                    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 mb-4">
                        <p className="text-sm text-primary-800 dark:text-primary-200">
                            يمكنك تحديث حالة المهمة وساعات العمل للمهام المعينة لك فقط. للتعديلات الأخرى، يرجى التواصل مع المشرف أو المدير.
                        </p>
                    </div>
                )}
                {role === 'volunteer' && task && !isVolunteerEditing && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                            هذه المهمة غير معينة لك. يمكنك فقط تعديل المهام المعينة لك.
                        </p>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="title">عنوان المهمة *</Label>
                    <Input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        placeholder="أدخل عنوان المهمة"
                        disabled={role === 'volunteer' && !!task}
                        className={role === 'volunteer' && !!task ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : ""}
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
                        disabled={role === 'volunteer' && !!task}
                        className={role === 'volunteer' && !!task ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : ""}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Only show status field when editing existing task */}
                    {task && (
                        <div className="space-y-2">
                            <Label htmlFor="status">حالة المهمة</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
                                disabled={role === 'volunteer' && !isVolunteerEditing}
                            >
                                <SelectTrigger className={role === 'volunteer' && !isVolunteerEditing ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : ""}>
                                    <SelectValue placeholder="اختر الحالة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="priority">درجة الأهمية</Label>
                        <Select
                            value={formData.priority}
                            onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
                            disabled={role === 'volunteer'}
                        >
                            <SelectTrigger className={role === 'volunteer' ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : ""}>
                                <SelectValue placeholder="اختر درجة الأهمية">
                                    {formData.priority && (
                                        <PriorityBadge priority={formData.priority as TaskPriority} />
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(PRIORITY_CONFIG).map(([value]) => (
                                    <SelectItem key={value} value={value}>
                                        <PriorityBadge priority={value as TaskPriority} />
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="due_date">تاريخ التسليم</Label>
                    <div className={role === 'volunteer' && !!task ? "pointer-events-none opacity-50" : ""}>
                        <DatePicker
                            value={formData.due_date || ''}
                            onChange={(date) => setFormData({ ...formData, due_date: date })}
                            placeholder="اختر تاريخ التسليم"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="assignee_ids">تعيين إلى</Label>

                    {role === 'volunteer' && !task ? (
                        <div className="space-y-2">
                            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={true}
                                        disabled
                                    />
                                    <span className="font-medium">
                                        {users?.find(u => u.id === currentUserId)?.name} (أنت)
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-primary mt-1">
                                الأعضاء يمكنهم إنشاء مهام لأنفسهم فقط
                            </p>
                        </div>
                    ) : role === 'volunteer' && task ? (
                        <div className="space-y-2">
                            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg border">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={formData.assignee_ids?.includes(currentUserId!) || false}
                                        disabled
                                    />
                                    <span className="font-medium">
                                        {users?.find(u => u.id === currentUserId)?.name} (أنت)
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                يمكنك فقط عرض المهام المعينة لك
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="ابحث عن مستخدم..."
                                    value={userSearch}
                                    onChange={(e) => setUserSearch(e.target.value)}
                                    className="mb-3"
                                />
                            </div>
                            <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                                {users
                                    ?.filter(u => u.status && u)
                                    .filter(user =>
                                        userSearch === '' ||
                                        user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                                        user.telegram_id?.toLowerCase().includes(userSearch.toLowerCase())
                                    )
                                    .map((user) => (
                                        <label key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                                            <Checkbox
                                                checked={formData.assignee_ids.includes(user.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setFormData({
                                                            ...formData,
                                                            assignee_ids: [...formData.assignee_ids, user.id]
                                                        });
                                                    } else {
                                                        setFormData({
                                                            ...formData,
                                                            assignee_ids: formData.assignee_ids.filter(id => id !== user.id)
                                                        });
                                                    }
                                                }}
                                            />
                                            <span className="text-sm select-none">
                                                {user.name} ({user.telegram_id})
                                            </span>
                                        </label>
                                    ))}
                            </div>
                            {formData.assignee_ids.length > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFormData({ ...formData, assignee_ids: [] })}
                                    className="text-xs"
                                >
                                    مسح الاختيار
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Only show work_hours field when editing existing task */}
                {task && (
                    <div className="space-y-2">
                        <Label htmlFor="work_hours">ساعات العمل</Label>
                        <Input
                            id="work_hours"
                            type="number"
                            step="0.5"
                            value={formData.work_hours}
                            onChange={(e) => setFormData({ ...formData, work_hours: parseFloat(e.target.value) })}
                            disabled={role === 'volunteer' && !isVolunteerEditing}
                            className={role === 'volunteer' && !isVolunteerEditing ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : ""}
                        />
                        {isVolunteerEditing && (
                            <p className="text-xs text-primary mt-1">
                                يمكنك تحديث حالة المهمة وساعات العمل
                            </p>
                        )}
                    </div>
                )}

                <div className="flex gap-2 justify-start pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        إلغاء
                    </Button>
                    <Button type="submit">
                        {isVolunteerEditing ? 'حفظ التعديلات' : task ? 'حفظ التعديلات' : 'إنشاء المهمة'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
