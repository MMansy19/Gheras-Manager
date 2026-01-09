import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createCourse,
    getAllCourses,
    getActiveCourse,
    getEnrollmentsWithAttendance,
    getCourseStats,
    deactivateCourse,
} from '../api/courseApi';
import { CreateCourseInput } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Calendar, Plus, Users, Award, Check, TrendingUp } from 'lucide-react';
import { DatePicker } from '../components/ui/date-picker';
import { Button } from '../components/ui/button';
import { Label } from '@/components/ui/label';

export const CourseManagement = () => {
    const queryClient = useQueryClient();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());

    const { data: courses, isLoading: coursesLoading } = useQuery({
        queryKey: ['courses'],
        queryFn: getAllCourses,
    });

    const { data: activeCourse } = useQuery({
        queryKey: ['activeCourse'],
        queryFn: getActiveCourse,
    });

    const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
        queryKey: ['enrollments', selectedCourseId],
        queryFn: () => selectedCourseId ? getEnrollmentsWithAttendance(selectedCourseId) : Promise.resolve([]),
        enabled: !!selectedCourseId,
    });

    const { data: courseStats } = useQuery({
        queryKey: ['courseStats', selectedCourseId],
        queryFn: () => selectedCourseId ? getCourseStats(selectedCourseId) : Promise.resolve(null),
        enabled: !!selectedCourseId,
    });

    const createCourseMutation = useMutation({
        mutationFn: (input: CreateCourseInput) => createCourse(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['activeCourse'] });
            setShowCreateForm(false);
            setStartDate(new Date());
        },
    });

    const deactivateCourseMutation = useMutation({
        mutationFn: (courseId: number) => deactivateCourse(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['activeCourse'] });
        },
    });

    useEffect(() => {
        if (activeCourse && !selectedCourseId) {
            setSelectedCourseId(activeCourse.id);
        }
    }, [activeCourse]);

    const handleCreateCourse = async () => {
        if (!startDate) return;

        const input: CreateCourseInput = {
            start_date: startDate.toISOString().split('T')[0],
        };

        createCourseMutation.mutate(input);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (coursesLoading) {
        return <LoadingSpinner message="جاري تحميل الدورات..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">إدارة الدورات</h1>
                    <p className="text-textSecondary dark:text-textSecondary-dark mt-1">
                        إدارة دورات غراس ومتابعة الحضور
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="gap-2"
                >
                    <Plus className="w-5 h-5" />
                    إنشاء دورة جديدة
                </Button>
            </div>

            {/* Create Course Form */}
            {showCreateForm && (
                <div className="card">
                    <h3 className="text-xl font-bold mb-4">إنشاء دورة جديدة</h3>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="start-date">
                                تاريخ بداية الدورة
                            </Label>
                            <DatePicker
                                value={startDate?.toISOString().split('T')[0] || ''}
                                onChange={(dateString) => setStartDate(dateString ? new Date(dateString) : undefined)}
                            />
                            <p className="text-sm text-textSecondary dark:text-textSecondary-dark mt-1">
                                ستنتهي الدورة تلقائياً بعد 10 أيام من تاريخ البداية
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleCreateCourse}
                                disabled={!startDate || createCourseMutation.isPending}
                            >
                                {createCourseMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء الدورة'}
                            </Button>
                            <Button
                                onClick={() => setShowCreateForm(false)}
                                variant="secondary"
                            >
                                إلغاء
                            </Button>
                        </div>

                        {createCourseMutation.isError && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                حدث خطأ في إنشاء الدورة
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Active Course Overview */}
            {activeCourse && (
                <div className="card bg-gradient-to-br from-primary-50 to-green-50 dark:from-primary-900/30 dark:to-green-900/30 border-primary">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-primary">الدورة النشطة</h3>
                            <p className="text-sm text-textSecondary dark:text-textSecondary-dark mt-1">
                                {formatDate(activeCourse.start_date)} - {formatDate(activeCourse.end_date)}
                            </p>
                        </div>
                        <span className="badge bg-green-500 text-white">نشطة</span>
                    </div>

                    {courseStats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-5 h-5 text-primary" />
                                    <span className="text-sm text-textSecondary dark:text-textSecondary-dark">
                                        إجمالي المسجلين
                                    </span>
                                </div>
                                <p className="text-2xl font-bold">{courseStats.totalEnrollments}</p>
                            </div>

                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="w-5 h-5 text-green-600" />
                                    <span className="text-sm text-textSecondary dark:text-textSecondary-dark">
                                        مكتملين
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-green-600">
                                    {courseStats.completedStudents}
                                </p>
                            </div>

                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    <span className="text-sm text-textSecondary dark:text-textSecondary-dark">
                                        اليوم الحالي
                                    </span>
                                </div>
                                <p className="text-2xl font-bold">
                                    {courseStats.currentDay || '-'} / 10
                                </p>
                            </div>

                            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    <span className="text-sm text-textSecondary dark:text-textSecondary-dark">
                                        متوسط الحضور
                                    </span>
                                </div>
                                <p className="text-2xl font-bold">
                                    {courseStats.averageAttendance.toFixed(1)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Enrollments Table */}
            {selectedCourseId && (
                <div className="card">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        المسجلين في الدورة ({enrollments?.length || 0})
                    </h3>

                    {enrollmentsLoading ? (
                        <LoadingSpinner message="جاري تحميل البيانات..." />
                    ) : enrollments && enrollments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>الاسم</th>
                                        <th>البريد الإلكتروني</th>
                                        <th>تاريخ التسجيل</th>
                                        <th>الحضور (10 أيام)</th>
                                        <th className="text-center">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrollments.map((enrollment) => (
                                        <tr key={enrollment.id}>
                                            <td className="font-semibold">{enrollment.full_name}</td>
                                            <td className="text-sm" dir="ltr">{enrollment.email}</td>
                                            <td className="text-sm">
                                                {formatDate(enrollment.created_at || '')}
                                            </td>
                                            <td>
                                                <div className="flex gap-1">
                                                    {Array.from({ length: 10 }, (_, i) => {
                                                        const day = i + 1;
                                                        const attended = enrollment.attendance_days.includes(day);
                                                        return (
                                                            <div
                                                                key={day}
                                                                className={`
                                                                    w-6 h-6 rounded flex items-center justify-center text-xs font-bold
                                                                    ${attended
                                                                        ? 'bg-green-500 text-white'
                                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                                                    }
                                                                `}
                                                                title={`يوم ${day}`}
                                                            >
                                                                {attended ? <Check className="w-3 h-3" /> : day}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                {enrollment.is_complete ? (
                                                    <span className="badge-status-done">
                                                        مكتمل
                                                    </span>
                                                ) : (
                                                    <span className="badge-status-in_progress">
                                                        {enrollment.attendance_count}/10
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-textSecondary dark:text-textSecondary-dark">
                            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>لا يوجد مسجلين في هذه الدورة بعد</p>
                        </div>
                    )}
                </div>
            )}

            {/* All Courses List */}
            {courses && courses.length > 0 && (
                <div className="card">
                    <h3 className="text-xl font-bold mb-4">جميع الدورات</h3>
                    <div className="space-y-3">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className={`
                                    p-4 rounded-lg border-2 transition-all cursor-pointer
                                    ${selectedCourseId === course.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                    }
                                `}
                                onClick={() => setSelectedCourseId(course.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">
                                            {formatDate(course.start_date)} - {formatDate(course.end_date)}
                                        </p>
                                        <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                                            معرف: {course.id}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {course.active ? (
                                            <span className="badge bg-green-500 text-white">نشطة</span>
                                        ) : (
                                            <span className="badge bg-gray-500 text-white">منتهية</span>
                                        )}
                                        {course.active && (
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm('هل تريد إلغاء تفعيل هذه الدورة؟')) {
                                                        deactivateCourseMutation.mutate(course.id);
                                                    }
                                                }}
                                                variant="destructive"
                                                size="sm"
                                            >
                                                إلغاء التفعيل
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
