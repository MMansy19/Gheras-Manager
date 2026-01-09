import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    getEnrollmentByUser,
    signDailyAttendance,
    getAttendanceByEnrollment,
    getCurrentDayNumber,
    hasCompleteAttendance,
    getCourseById,
} from '../api/courseApi';
import { CourseLoginInput, CourseLoginSchema, Enrollment, DailyAttendance } from '../types';
import { LogIn, Mail, Lock, Check, Calendar } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface CourseLoginFormProps {
    courseId: number;
    onCertificateReady: (enrollmentId: number, fullName: string) => void;
}

export const CourseLoginForm = ({ courseId, onCertificateReady }: CourseLoginFormProps) => {
    const [formData, setFormData] = useState<CourseLoginInput>({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [attendances, setAttendances] = useState<DailyAttendance[]>([]);
    const [currentDay, setCurrentDay] = useState<number | null>(null);
    const [signedToday, setSignedToday] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        loadCurrentDay();
    }, [courseId]);

    useEffect(() => {
        if (enrollment && currentDay) {
            checkTodaySignature();
        }
    }, [enrollment, attendances, currentDay]);

    const loadCurrentDay = async () => {
        try {
            const day = await getCurrentDayNumber(courseId);
            setCurrentDay(day);
        } catch (err) {
            console.error('Error loading current day:', err);
        }
    };

    const checkTodaySignature = () => {
        if (!currentDay || !attendances) return;
        const hasSigned = attendances.some(att => att.day_number === currentDay);
        setSignedToday(hasSigned);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate form data
            const validated = CourseLoginSchema.parse(formData);

            // Sign in with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: validated.email,
                password: validated.password,
            });

            if (authError) {
                if (authError.message.includes('Invalid')) {
                    setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
                } else {
                    setError(`خطأ في تسجيل الدخول: ${authError.message}`);
                }
                return;
            }

            if (!authData.user) {
                setError('فشل تسجيل الدخول');
                return;
            }

            // Get course and user enrollment
            const course = await getCourseById(courseId);

            if (!course) {
                setError('لا توجد دورة بهذا المعرف');
                return;
            }

            const userEnrollment = await getEnrollmentByUser(authData.user.id, course.id);

            if (!userEnrollment) {
                setError('لم يتم العثور على تسجيلك في الدورة');
                return;
            }

            // Load attendance records
            const userAttendances = await getAttendanceByEnrollment(userEnrollment.id);
            setEnrollment(userEnrollment);
            setAttendances(userAttendances);

            // Check if already signed today
            const day = await getCurrentDayNumber(courseId);
            if (!day) {
                setError('الدورة غير نشطة حالياً');
                return;
            }

            const alreadySigned = userAttendances.some(att => att.day_number === day);

            if (!alreadySigned) {
                // Sign attendance for today
                await signDailyAttendance(userEnrollment.id, day);
                const updatedAttendances = await getAttendanceByEnrollment(userEnrollment.id);
                setAttendances(updatedAttendances);
                setSignedToday(true);
            } else {
                setSignedToday(true);
            }

            // Check if course is complete
            const complete = await hasCompleteAttendance(userEnrollment.id);
            setIsComplete(complete);

            if (complete) {
                onCertificateReady(userEnrollment.id, userEnrollment.full_name);
            }
        } catch (err: any) {
            if (err.errors) {
                setError(err.errors[0]?.message || 'يرجى التحقق من البيانات المدخلة');
            } else {
                setError(err.message || 'حدث خطأ. يرجى المحاولة مرة أخرى.');
            }
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {!enrollment ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <Label htmlFor="email" className="mb-2">
                            البريد الإلكتروني
                        </Label>
                        <div className="relative">
                            <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary dark:text-textSecondary-dark pointer-events-none" />
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="pr-10"
                                placeholder="example@email.com"
                                required
                                disabled={loading}
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <Label htmlFor="password" className="mb-2">
                            كلمة المرور
                        </Label>
                        <div className="relative">
                            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary dark:text-textSecondary-dark pointer-events-none" />
                            <Input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="pr-10"
                                placeholder="أدخل كلمة المرور"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Current Day Info */}
                    {currentDay && (
                        <div className="p-3 bg-primary/10 dark:bg-primary/20 border border-primary/30 rounded-lg text-center">
                            <div className="flex items-center justify-center gap-2 text-primary dark:text-primary-300">
                                <Calendar className="w-5 h-5" />
                                <span className="font-semibold">اليوم {currentDay} من 10</span>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full gap-2"
                        size="lg"
                        disabled={loading}
                    >
                        <LogIn className="w-5 h-5" />
                        {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الحضور'}
                    </Button>
                </form>
            ) : (
                /* Success State - Show Attendance Progress */
                <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                            <div>
                                <h3 className="font-bold text-green-800 dark:text-green-300">
                                    {signedToday ? 'تم تسجيل حضورك اليوم!' : 'مرحباً بك'}
                                </h3>
                                <p className="text-sm text-green-700 dark:text-green-400">
                                    {enrollment.full_name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Grid */}
                    <div className="card">
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            سجل الحضور
                        </h4>
                        <div className="grid grid-cols-5 gap-2">
                            {Array.from({ length: 10 }, (_, i) => {
                                const day = i + 1;
                                const attended = attendances.some(att => att.day_number === day);
                                const isToday = day === currentDay;

                                return (
                                    <div
                                        key={day}
                                        className={`
                                            p-3 rounded-lg text-center font-semibold transition-all
                                            ${attended
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-2 border-green-500'
                                                : isToday
                                                    ? 'bg-primary/10 dark:bg-primary/20 text-primary border-2 border-primary'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-2 border-gray-300 dark:border-gray-700'
                                            }
                                        `}
                                    >
                                        <div className="text-xs mb-1">يوم</div>
                                        <div className="text-lg">{day}</div>
                                        {attended && <Check className="w-4 h-4 mx-auto mt-1" />}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                                الحضور: <span className="font-bold text-primary">{attendances.length}</span> من 10 أيام
                            </p>
                            {isComplete && (
                                <div className="mt-3 p-3 bg-gradient-to-r from-primary-50 to-green-50 dark:from-primary-900/30 dark:to-green-900/30 border border-primary rounded-lg">
                                    <p className="font-bold text-primary">
                                        🎉 مبارك! لقد أكملت الدورة بنجاح
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
