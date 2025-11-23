'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchUsers, createUser, updateUser } from '../api/mockApi';
import { User, ROLE_LABELS } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { useRole } from '../hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const UsersManagement = () => {
    const { role } = useRole();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    useEffect(() => {
        if (role !== 'admin' && role !== 'supervisor') {
            navigate('/app/team/design');
        }
    }, [role, navigate]);

    const { data: users, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });

    const createUserMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsCreateModalOpen(false);
            toast.success('تم إنشاء المستخدم بنجاح');
        },
        onError: () => {
            toast.error('فشل إنشاء المستخدم');
        },
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
            updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setEditingUser(null);
            toast.success('تم تحديث المستخدم بنجاح');
        },
        onError: () => {
            toast.error('فشل تحديث المستخدم');
        },
    });

    const toggleUserStatus = (user: User) => {
        updateUserMutation.mutate({
            id: user.id,
            data: { status: !user.status },
        });
    };

    const filteredUsers = users?.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <LoadingSpinner message="جاري تحميل المستخدمين..." />;
    }

    if (error) {
        return (
            <EmptyState
                icon="⚠️"
                title="خطأ في تحميل المستخدمين"
                description="حدث خطأ أثناء تحميل المستخدمين. يرجى المحاولة مرة أخرى."
                action={{ label: 'إعادة المحاولة', onClick: () => window.location.reload() }}
            />
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row-reverse items-start sm:items-center justify-between gap-4">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary"
                >
                    ➕ إضافة مستخدم
                </button>
                <div>
                    <h1 className="text-3xl font-bold mb-1">إدارة المستخدمين</h1>
                    <p className="text-textSecondary dark:text-textSecondary-dark">
                        إدارة حسابات المستخدمين والصلاحيات
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="card mb-6">
                <input
                    type="text"
                    placeholder="🔍 البحث عن مستخدم (الاسم أو البريد الإلكتروني)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                />
            </div>

            {/* Users Table */}
            <div className="card overflow-x-auto">
                {filteredUsers && filteredUsers.length > 0 ? (
                    <table className="table" aria-label="جدول المستخدمين">
                        <thead>
                            <tr>
                                <th>الإجراءات</th>
                                <th>الحالة</th>
                                <th>الفرق</th>
                                <th>الدور</th>
                                <th>البريد الإلكتروني</th>
                                <th>الاسم</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="text-sm btn-secondary py-1 px-2"
                                            >
                                                ✏️ تعديل
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => toggleUserStatus(user)}
                                            className={`badge ${user.status
                                                    ? 'badge-status-done'
                                                    : 'badge-status-issue'
                                                }`}
                                        >
                                            {user.status ? 'نشط' : 'معطل'}
                                        </button>
                                    </td>
                                    <td>
                                        <div className="flex gap-1 flex-wrap justify-end">
                                            {user.teams.map((teamId) => (
                                                <span key={teamId} className="badge bg-primary/20 text-primary">
                                                    {teamId}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="font-medium">{ROLE_LABELS[user.role]}</span>
                                    </td>
                                    <td>
                                        <span className="text-sm text-textSecondary dark:text-textSecondary-dark">
                                            {user.email}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="font-semibold">{user.name}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <EmptyState
                        icon="👥"
                        title="لا يوجد مستخدمون"
                        description="لم يتم العثور على مستخدمين. جرب البحث بكلمات أخرى."
                    />
                )}
            </div>

            {/* Create/Edit User Modal */}
            <UserFormModal
                isOpen={isCreateModalOpen || !!editingUser}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditingUser(null);
                }}
                user={editingUser}
                onSubmit={(data) => {
                    if (editingUser) {
                        updateUserMutation.mutate({ id: editingUser.id, data });
                    } else {
                        createUserMutation.mutate(data);
                    }
                }}
            />
        </div>
    );
};

// UserFormModal Component
interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSubmit: (data: any) => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({
    isOpen,
    onClose,
    user,
    onSubmit,
}) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        role: user?.role || 'volunteer',
        status: user?.status ?? true,
        telegram_id: user?.telegram_id || '',
        job_title: user?.job_title || '',
        weekly_hours: user?.weekly_hours || 0,
        teams: user?.teams || [],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user && formData.password !== formData.password_confirmation) {
            toast.error('كلمتا المرور غير متطابقتين');
            return;
        }

        if (!user && formData.password.length < 6) {
            toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        onSubmit(formData);
    };

    const handleTeamsChange = (teamId: number) => {
        if (formData.teams.includes(teamId)) {
            setFormData({
                ...formData,
                teams: formData.teams.filter((id) => id !== teamId),
            });
        } else {
            setFormData({
                ...formData,
                teams: [...formData.teams, teamId],
            });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={user ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name">الاسم الكامل *</label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="أدخل الاسم الكامل"
                        />
                    </div>

                    <div>
                        <label htmlFor="email">البريد الإلكتروني *</label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="user@example.com"
                        />
                    </div>
                </div>

                {!user && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="password">كلمة المرور *</label>
                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                placeholder="******"
                                minLength={6}
                            />
                        </div>

                        <div>
                            <label htmlFor="password_confirmation">تأكيد كلمة المرور *</label>
                            <input
                                id="password_confirmation"
                                type="password"
                                value={formData.password_confirmation}
                                onChange={(e) =>
                                    setFormData({ ...formData, password_confirmation: e.target.value })
                                }
                                required
                                placeholder="******"
                                minLength={6}
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="role">الدور</label>
                        <select
                            id="role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                        >
                            {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="status">الحالة</label>
                        <div className="flex items-center gap-2 mt-2">
                            <input
                                id="status"
                                type="checkbox"
                                checked={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                            />
                            <label htmlFor="status" className="mb-0">
                                {formData.status ? 'نشط' : 'معطل'}
                            </label>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="telegram_id">معرف تلجرام</label>
                        <input
                            id="telegram_id"
                            type="text"
                            value={formData.telegram_id || ''}
                            onChange={(e) => setFormData({ ...formData, telegram_id: e.target.value })}
                            placeholder="@username"
                        />
                    </div>

                    <div>
                        <label htmlFor="job_title">مجال العمل</label>
                        <input
                            id="job_title"
                            type="text"
                            value={formData.job_title || ''}
                            onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                            placeholder="مثال: مطور ويب"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="weekly_hours">ساعات التفرغ الأسبوعية</label>
                    <input
                        id="weekly_hours"
                        type="number"
                        value={formData.weekly_hours || 0}
                        onChange={(e) =>
                            setFormData({ ...formData, weekly_hours: parseInt(e.target.value) || 0 })
                        }
                        placeholder="0"
                    />
                </div>

                <div>
                    <label>الفرق</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {[1, 2, 3, 4, 5].map((teamId) => (
                            <label key={teamId} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.teams.includes(teamId)}
                                    onChange={() => handleTeamsChange(teamId)}
                                />
                                <span className="text-sm">فريق {teamId}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 justify-start pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">
                        إلغاء
                    </button>
                    <button type="submit" className="btn-primary">
                        {user ? 'حفظ التعديلات' : 'إنشاء المستخدم'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
