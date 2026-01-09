import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createCourse,
    getAllCourses,
    getActiveCourse,
    getEnrollmentsWithAttendance,
    getCourseStats,
    deactivateCourse,
    updateCourse,
} from '../api/courseApi';
import { CreateCourseInput, UpdateCourseInput, Course } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Calendar, Plus, Users, Award, Check, TrendingUp, Edit2 } from 'lucide-react';
import { DatePicker } from '../components/ui/date-picker';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const CourseManagement = () => {
    const queryClient = useQueryClient();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [startDate, setStartDate] = useState<Date | undefined>(new Date());
    const [courseTitle, setCourseTitle] = useState('دورة غراس لمدة 10 أيام');
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editStartDate, setEditStartDate] = useState<Date | undefined>();
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        courseId: number | null;
    }>({ isOpen: false, courseId: null });

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
            setCourseTitle('دورة غراس لمدة 10 أيام');
        },
    });

    const updateCourseMutation = useMutation({
        mutationFn: ({ courseId, input }: { courseId: number; input: UpdateCourseInput }) =>
            updateCourse(courseId, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['activeCourse'] });
            setEditingCourse(null);
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

    // Get the selected course from the courses list
    const selectedCourse = courses?.find(c => c.id === selectedCourseId);

    const handleCreateCourse = async () => {
        if (!startDate || !courseTitle.trim()) return;

        const input: CreateCourseInput = {
            title: courseTitle,
            start_date: startDate.toISOString().split('T')[0],
        };

        createCourseMutation.mutate(input);
    };

    const handleEditCourse = (course: Course) => {
        setEditingCourse(course);
        setEditTitle(course.title);
        setEditStartDate(new Date(course.start_date));
    };

    const handleUpdateCourse = async () => {
        if (!editingCourse || !editTitle.trim()) return;

        const input: UpdateCourseInput = {
            title: editTitle,
        };

        if (editStartDate) {
            input.start_date = editStartDate.toISOString().split('T')[0];
        }

        updateCourseMutation.mutate({
            courseId: editingCourse.id,
            input,
        });
    };

    const handleDeactivateCourse = () => {
        if (confirmDialog.courseId) {
            deactivateCourseMutation.mutate(confirmDialog.courseId);
            setConfirmDialog({ isOpen: false, courseId: null });
        }
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
                            <Label htmlFor="course-title">
                                عنوان الدورة
                            </Label>
                            <Input
                                id="course-title"
                                value={courseTitle}
                                onChange={(e) => setCourseTitle(e.target.value)}
                                placeholder="دورة غراس لمدة 10 أيام"
                            />
                        </div>
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
                                disabled={!startDate || !courseTitle.trim() || createCourseMutation.isPending}
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

            {/* Edit Course Form */}
            {editingCourse && (
                <div className="card">
                    <h3 className="text-xl font-bold mb-4">تعديل الدورة</h3>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit-course-title">
                                عنوان الدورة
                            </Label>
                            <Input
                                id="edit-course-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="دورة غراس لمدة 10 أيام"
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-start-date">
                                تاريخ بداية الدورة
                            </Label>
                            <DatePicker
                                value={editStartDate?.toISOString().split('T')[0] || ''}
                                onChange={(dateString) => setEditStartDate(dateString ? new Date(dateString) : undefined)}
                            />
                            <p className="text-sm text-textSecondary dark:text-textSecondary-dark mt-1">
                                سيتم تحديث تاريخ النهاية تلقائياً (+9 أيام)
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleUpdateCourse}
                                disabled={!editTitle.trim() || updateCourseMutation.isPending}
                            >
                                {updateCourseMutation.isPending ? 'جاري التحديث...' : 'حفظ التغييرات'}
                            </Button>
                            <Button
                                onClick={() => setEditingCourse(null)}
                                variant="secondary"
                            >
                                إلغاء
                            </Button>
                        </div>

                        {updateCourseMutation.isError && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                حدث خطأ في تحديث الدورة
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Active Course Overview */}
            {selectedCourse && !editingCourse && (
                <div className="card bg-gradient-to-br from-primary-50 to-green-50 dark:from-primary-900/30 dark:to-green-900/30 border-primary">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-primary">{selectedCourse.title}</h3>
                                <Button
                                    onClick={() => handleEditCourse(selectedCourse)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-primary"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                                {formatDate(selectedCourse.start_date)} - {formatDate(selectedCourse.end_date)}
                            </p>
                        </div>
                        <span className={`badge ${selectedCourse.active ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                            {selectedCourse.active ? 'نشطة' : 'منتهية'}
                        </span>
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
                                    <div className="flex-1">
                                        <h4 className="font-bold text-lg mb-1">{course.title}</h4>
                                        <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                                            {formatDate(course.start_date)} - {formatDate(course.end_date)}
                                        </p>
                                        <p className="text-xs text-textSecondary dark:text-textSecondary-dark mt-1">
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
                                                    setConfirmDialog({ isOpen: true, courseId: course.id });
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

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ isOpen: false, courseId: null })}
                onConfirm={handleDeactivateCourse}
                title="إلغاء تفعيل الدورة"
                message="هل أنت متأكد من إلغاء تفعيل هذه الدورة؟ لن يتمكن الطلاب من التسجيل أو تسجيل الحضور بعد ذلك."
                confirmText="إلغاء التفعيل"
                cancelText="إلغاء"
                variant="danger"
            />
        </div>
    );
};
