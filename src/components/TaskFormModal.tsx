import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePicker } from './ui/date-picker';
import { Button } from './ui/button';
import { Task, TaskPriority, TaskStatus, PRIORITY_LABELS, STATUS_LABELS } from '../types';

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

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
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
        status: 'new' as TaskStatus,
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
                status: task.status || 'new',
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
                status: 'new',
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
                        <Label htmlFor="status">حالة المهمة</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
                        >
                            <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                    <Label htmlFor="due_date">تاريخ التسليم</Label>
                    <DatePicker
                        value={formData.due_date || ''}
                        onChange={(date) => setFormData({ ...formData, due_date: date })}
                        placeholder="اختر تاريخ التسليم"
                    />
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
