import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CourseRegistrationForm } from '../components/CourseRegistrationForm';
import { CourseLoginForm } from '../components/CourseLoginForm';
import { getActiveCourse, isRegistrationDay, getCurrentDayNumber } from '../api/courseApi';
import { generateCertificate } from '../lib/certificateGenerator';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Award, Calendar, ArrowLeft } from 'lucide-react';
import { Course } from '../types';
import { Button } from '../components/ui/button';

export const WelcomePage = () => {
    const navigate = useNavigate();
    const [activeCourse, setActiveCourse] = useState<Course | null>(null);
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
            const course = await getActiveCourse();
            setActiveCourse(course);

            if (course) {
                const isDay1 = await isRegistrationDay();
                setIsRegistration(isDay1);

                const day = await getCurrentDayNumber();
                setCurrentDay(day);
            }
        } catch (err) {
            console.error('Error loading course data:', err);
        } finally {
            setLoading(false);
        }
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
                        دورة غراس لمدة 10 أيام
                    </h1>
                    <p className="text-base text-textSecondary dark:text-textSecondary-dark font-semibold">
                        أكاديمية غراس العلم
                    </p>
                </div>

                {/* Main Content */}
                {!activeCourse ? (
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
                            <CourseRegistrationForm onSuccess={handleRegistrationSuccess} />
                        ) : (
                            <CourseLoginForm onCertificateReady={handleCertificateReady} />
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
