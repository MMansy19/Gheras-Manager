'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, updateCurrentUser, fetchTeams } from '../api/mockApi';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ROLE_LABELS, WORK_FIELDS, User as UserType } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { User, Mail, MapPin, Briefcase, Calendar, Clock, Users as UsersIcon, Save, X } from 'lucide-react';

export const Profile = () => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        telegram_id: '',
        job_field: '',
        experience_years: 0,
        age: 0,
        country: '',
        weekly_hours: 0,
    });

    const {
        data: currentUser,
        isLoading,
    } = useQuery<UserType>({
        queryKey: ['currentUser'],
        queryFn: getCurrentUser,
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name,
                email: currentUser.email,
                telegram_id: currentUser.telegram_id || '',
                job_field: currentUser.job_field || '',
                experience_years: currentUser.experience_years || 0,
                age: currentUser.age || 0,
                country: currentUser.country || '',
                weekly_hours: currentUser.weekly_hours || 0,
            });
        }
    }, [currentUser]);

    const { data: teams = [] } = useQuery({
        queryKey: ['teams'],
        queryFn: fetchTeams,
    });

    const updateMutation = useMutation({
        mutationFn: updateCurrentUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            toast.success('تم تحديث الملف الشخصي بنجاح');
            setIsEditing(false);
        },
        onError: () => {
            toast.error('فشل تحديث الملف الشخصي');
        },
    });

    if (isLoading) return <LoadingSpinner message="جاري تحميل البيانات..." />;

    if (!currentUser) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">لم يتم العثور على ملف المستخدم</p>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate({
            name: formData.name,
            email: formData.email,
            telegram_id: formData.telegram_id || null,
            job_field: formData.job_field || null,
            experience_years: formData.experience_years || null,
            age: formData.age || null,
            country: formData.country || null,
            weekly_hours: formData.weekly_hours || null,
        });
    };

    const handleCancel = () => {
        setFormData({
            name: currentUser.name,
            email: currentUser.email,
            telegram_id: currentUser.telegram_id || '',
            job_field: currentUser.job_field || '',
            experience_years: currentUser.experience_years || 0,
            age: currentUser.age || 0,
            country: currentUser.country || '',
            weekly_hours: currentUser.weekly_hours || 0,
        });
        setIsEditing(false);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">ملفي الشخصي</h1>
                    <p className="text-textSecondary dark:text-textSecondary-dark mt-2">معلومات الملف الشخصي والتفاصيل الأساسية</p>
                </div>
                {/* {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Edit2 className="w-4 h-4" />
                        تعديل الملف
                    </button>
                )} */}
            </div>

            <form onSubmit={handleSubmit}>
                {/* Profile Header Card */}
                <div className="card mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-bold text-primary flex-shrink-0">
                            {currentUser.name.charAt(0)}
                        </div>

                        <div className="flex-1">
                            <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                            <p className="text-textSecondary dark:text-textSecondary-dark mt-1">
                                <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                                    {ROLE_LABELS[currentUser.role]}
                                </span>
                            </p>
                            <p className="text-sm text-textSecondary dark:text-textSecondary-dark mt-3">
                                {currentUser.status ? '✓ نشط' : '✗ معطل'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="card space-y-4 mb-6">
                    <h3 className="text-lg font-bold">معلومات التواصل</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-1">البريد الإلكتروني</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input w-full"
                                        required
                                    />
                                ) : (
                                    <p className="font-medium">{currentUser.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-1">معرف التلجرام</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.telegram_id}
                                        onChange={(e) => setFormData({ ...formData, telegram_id: e.target.value })}
                                        className="input w-full"
                                        placeholder="@username"
                                    />
                                ) : (
                                    <p className="font-medium">{currentUser.telegram_id || '-'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Information */}
                <div className="card space-y-4 mb-6">
                    <h3 className="text-lg font-bold">المعلومات الوظيفية</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <Briefcase className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-1">مجال العمل</p>
                                {isEditing ? (
                                    <Select
                                        value={formData.job_field}
                                        onValueChange={(value) => setFormData({ ...formData, job_field: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر مجال العمل" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">اختر مجال العمل</SelectItem>
                                            {WORK_FIELDS.map((field) => (
                                                <SelectItem key={field} value={field}>
                                                    {field}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="font-medium">{currentUser.job_field || '-'}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-1">سنوات الخبرة</p>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={formData.experience_years}
                                        onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                                        className="input w-full"
                                        min="0"
                                        max="50"
                                    />
                                ) : (
                                    <p className="font-medium">{currentUser.experience_years ? `${currentUser.experience_years} سنوات` : '-'}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-1">ساعات العمل الأسبوعية</p>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={formData.weekly_hours}
                                        onChange={(e) => setFormData({ ...formData, weekly_hours: parseInt(e.target.value) || 0 })}
                                        className="input w-full"
                                        min="0"
                                        max="168"
                                    />
                                ) : (
                                    <p className="font-medium">{currentUser.weekly_hours ? `${currentUser.weekly_hours} ساعة` : '-'}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-1">الدولة</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="input w-full"
                                        placeholder="مصر"
                                    />
                                ) : (
                                    <p className="font-medium">{currentUser.country || '-'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="card space-y-4 mb-6">
                    <h3 className="text-lg font-bold">المعلومات الشخصية</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-1">الاسم</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input w-full"
                                        required
                                    />
                                ) : (
                                    <p className="font-medium">{currentUser.name}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm text-textSecondary dark:text-textSecondary-dark mb-1">العمر</p>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                                        className="input w-full"
                                        min="0"
                                        max="120"
                                    />
                                ) : (
                                    <p className="font-medium">{currentUser.age ? `${currentUser.age} سنة` : '-'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                    <div className="card bg-gray-50 dark:bg-gray-800/50 border-2 border-primary/20">
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                        </div>
                    </div>
                )}
            </form>

            {/* Teams */}
            {currentUser.teams && currentUser.teams.length > 0 && (
                <div className="card space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <UsersIcon className="w-5 h-5 text-primary" />
                        الفرق المشارك فيها
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {currentUser.teams.map((teamId) => {
                            const team = teams.find(t => t.id === teamId);
                            return (
                                <div
                                    key={teamId}
                                    className="p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 dark:border-primary/30"
                                >
                                    <p className="text-sm font-medium text-primary">
                                        {team ? team.name : `فريق #${teamId}`}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Account Information */}
            <div className="card space-y-4 border-l-4 border-blue-500">
                <h3 className="text-lg font-bold">معلومات الحساب</h3>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-textSecondary dark:text-textSecondary-dark">تاريخ الإنشاء:</span>
                        <span className="font-medium">
                            {currentUser.created_at
                                ? new Date(currentUser.created_at).toLocaleDateString('ar-EG')
                                : '-'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-textSecondary dark:text-textSecondary-dark">آخر تحديث:</span>
                        <span className="font-medium">
                            {currentUser.updated_at
                                ? new Date(currentUser.updated_at).toLocaleDateString('ar-EG')
                                : '-'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
