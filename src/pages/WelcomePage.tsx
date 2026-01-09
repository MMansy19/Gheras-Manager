import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CourseRegistrationForm } from '../components/CourseRegistrationForm';
import { CourseLoginForm } from '../components/CourseLoginForm';
import { getActiveCourses, isRegistrationDay, getCurrentDayNumber } from '../api/courseApi';
import { generateCertificate } from '../lib/certificateGenerator';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Award, Calendar, ArrowLeft, BookOpen } from 'lucide-react';
import { Course } from '../types';
import { Button } from '../components/ui/button';

export const WelcomePage = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isRegistration, setIsRegistration] = useState(false);
    const [currentDay, setCurrentDay] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [certificateReady, setCertificateReady] = useState(false);
    const [certificateData, setCertificateData] = useState<{
        enrollmentId: number;
        fullName: string;
    } | null>(null);
    const [downloadingCert, setDownloadingCert] = useState(false);

    useEffect(() => {
        loadCourseData();
    }, []);

    const loadCourseData = async () => {
        try {
            setLoading(true);
            const activeCourses = await getActiveCourses();
            setCourses(activeCourses);
            
            // Auto-select first course if only one
            if (activeCourses.length === 1) {
                handleCourseSelect(activeCourses[0]);
            }
        } catch (err) {
            console.error('Error loading course data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseSelect = async (course: Course) => {
        setSelectedCourse(course);
        
        const isDay1 = await isRegistrationDay(course.id);
        setIsRegistration(isDay1);

        const day = await getCurrentDayNumber(course.id);
        setCurrentDay(day);
    };

    const handleRegistrationSuccess = () => {
        // Show success message and reload to show login form
        setTimeout(() => {
            loadCourseData();
        }, 2000);
    };

    const handleCertificateReady = (enrollmentId: number, fullName: string) => {
        setCertificateReady(true);
        setCertificateData({ enrollmentId, fullName });
    };

    const handleDownloadCertificate = async () => {
        if (!certificateData) return;

        try {
            setDownloadingCert(true);
            await generateCertificate(certificateData.fullName);
        } catch (err) {
            console.error('Error generating certificate:', err);
            alert('حدث خطأ في توليد الشهادة. يرجى المحاولة مرة أخرى.');
        } finally {
            setDownloadingCert(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return <LoadingSpinner message="جاري التحميل..." />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 p-4 relative">
            {/* Background Image */}
            <img
                src="/home-bg.webp"
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
                aria-hidden="true"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/90 backdrop-blur-sm"></div>

            <div className="max-w-md w-full relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <img
                            src="/logo.png"
                            alt="شعار غراس"
                            fetchPriority="high"
                            width="96"
                            height="96"
                            className="h-20 w-20 md:h-24 md:w-24 object-contain drop-shadow-lg"
                        />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black mb-3 text-primary drop-shadow-md">
                        {selectedCourse?.title || 'دورة غراس لمدة 10 أيام'}
                    </h1>
                    <p className="text-base text-textSecondary dark:text-textSecondary-dark font-semibold">
                        أكاديمية غراس العلم
                    </p>
                    {selectedCourse && (
                        <p className="text-sm text-textSecondary dark:text-textSecondary-dark mt-2">
                            {formatDate(selectedCourse.start_date)} - {formatDate(selectedCourse.end_date)}
                        </p>
                    )}
                </div>

                {/* Main Content */}
                {courses.length === 0 ? (
                    /* No Active Course */
                    <div className="card text-center">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-xl font-bold mb-2">لا توجد دورة نشطة حالياً</h2>
                        <p className="text-textSecondary dark:text-textSecondary-dark mb-4">
                            يرجى التواصل مع الإدارة لمعرفة موعد الدورة القادمة
                        </p>
                        <Button
                            onClick={() => navigate('/admin/select-role')}
                            variant="secondary"
                            className="gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            الدخول كمسؤول
                        </Button>
                    </div>
                ) : certificateReady ? (
                    /* Certificate Ready */
                    <div className="card text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary to-green-500 rounded-full flex items-center justify-center">
                                <Award className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black mb-2 text-primary">
                            مبروك {certificateData?.fullName}!
                        </h2>
                        <p className="text-lg font-semibold mb-4">
                            لقد أكملت دورة غراس بنجاح
                        </p>
                        <p className="text-textSecondary dark:text-textSecondary-dark mb-6">
                            حضرت جميع الأيام العشرة. يمكنك الآن تحميل شهادة إتمام الدورة
                        </p>
                        <Button
                            onClick={handleDownloadCertificate}
                            className="w-full gap-2 mb-3"
                            size="lg"
                            disabled={downloadingCert}
                        >
                            <Award className="w-5 h-5" />
                            {downloadingCert ? 'جاري التحميل...' : 'تحميل الشهادة'}
                        </Button>
                        <Button
                            onClick={() => navigate('/admin/select-role')}
                            variant="ghost"
                            size="sm"
                        >
                            الدخول كمسؤول
                        </Button>
                    </div>
                ) : !selectedCourse ? (
                    /* Course Selection */
                    <div className="card">
                        <h2 className="text-2xl font-bold mb-4 text-center">اختر الدورة</h2>
                        <p className="text-textSecondary dark:text-textSecondary-dark text-center mb-6">
                            يرجى اختيار الدورة للتسجيل أو تسجيل الحضور
                        </p>
                        <div className="space-y-3">
                            {courses.map((course) => (
                                <button
                                    key={course.id}
                                    onClick={() => handleCourseSelect(course)}
                                    className="w-full p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all text-right"
                                >
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-6 h-6 text-primary flex-shrink-0" />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                                            <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                                                {formatDate(course.start_date)} - {formatDate(course.end_date)}
                                            </p>
                                        </div>
                                        <ArrowLeft className="w-5 h-5 text-primary transform" />
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        {/* Admin Link */}
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                            <button
                                onClick={() => navigate('/admin/select-role')}
                                className="text-sm text-textSecondary dark:text-textSecondary-dark hover:text-primary transition-colors"
                            >
                                الدخول كمسؤول ←
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Registration or Login Form */
                    <div className="card">
                        {currentDay && (
                            <div className="mb-4 p-3 bg-primary/10 dark:bg-primary/20 border border-primary/30 rounded-lg text-center">
                                <div className="flex items-center justify-center gap-2 text-primary dark:text-primary-300 font-semibold">
                                    <Calendar className="w-5 h-5" />
                                    <span>اليوم {currentDay} من 10</span>
                                </div>
                            </div>
                        )}

                        <h2 className="text-2xl font-bold mb-6 text-center">
                            {isRegistration ? 'التسجيل في الدورة' : 'تسجيل الحضور اليومي'}
                        </h2>

                        {isRegistration ? (
                            <CourseRegistrationForm 
                                courseId={selectedCourse.id} 
                                onSuccess={handleRegistrationSuccess} 
                            />
                        ) : (
                            <CourseLoginForm 
                                courseId={selectedCourse.id} 
                                onCertificateReady={handleCertificateReady} 
                            />
                        )}

                        {/* Back to Course Selection */}
                        {courses.length > 1 && (
                            <div className="mt-4" dir='rtl'>
                                <Button
                                    onClick={() => setSelectedCourse(null)}
                                    variant="outline"
                                    className="w-full"
                                    size="sm"
                                >
                                     → العودة لاختيار الدورة
                                </Button>
                            </div>
                        )}

                        {/* Admin Link */}
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                            <button
                                onClick={() => navigate('/admin/select-role')}
                                className="text-sm text-textSecondary dark:text-textSecondary-dark hover:text-primary transition-colors"
                            >
                                الدخول كمسؤول ←
                            </button>
                        </div>
                    </div>
                )}

                {/* Info Footer */}
                <div className="mt-6 text-center text-sm text-textSecondary dark:text-textSecondary-dark">
                    <p>
                        يجب الحضور يومياً لمدة 10 أيام للحصول على الشهادة
                    </p>
                </div>
            </div>
        </div>
    );
};
