import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { createEnrollment, getCourseById, getEnrollmentByEmail, getEnrollmentByEmailAny } from '../api/courseApi';
import { CourseRegistrationInput, CourseRegistrationSchema } from '../types';
import { UserPlus, Mail, Lock, User, Info } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface CourseRegistrationFormProps {
    courseId: number;
    onSuccess: () => void;
}

export const CourseRegistrationForm = ({ courseId, onSuccess }: CourseRegistrationFormProps) => {
    const [formData, setFormData] = useState<CourseRegistrationInput>({
        full_name: '',
        email: '',
        password: '',
        confirm_password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [existingUser, setExistingUser] = useState(false);
    const [checkingEmail, setCheckingEmail] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setError('');
    };

    const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const email = e.target.value.trim();
        if (!email || !email.includes('@')) return;

        setCheckingEmail(true);
        setError('');
        
        try {
            // Check if email exists in any course
            const enrollment = await getEnrollmentByEmailAny(email);
            
            if (enrollment) {
                // User has an account, auto-fill name
                setFormData(prev => ({
                    ...prev,
                    full_name: enrollment.full_name,
                }));
                setExistingUser(true);
            } else {
                setExistingUser(false);
            }
        } catch (err: any) {
            console.error('Error checking email:', err);
        } finally {
            setCheckingEmail(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // For existing users, auto-set confirm_password to match password
            const dataToValidate = existingUser 
                ? { ...formData, confirm_password: formData.password }
                : formData;

            // Validate form data
            const validated = CourseRegistrationSchema.parse(dataToValidate);

            // Get course by ID
            const course = await getCourseById(courseId);
            if (!course) {
                setError('لا توجد دورة بهذا المعرف');
                return;
            }

            // Check if email is already enrolled in this course
            const existingEnrollment = await getEnrollmentByEmail(validated.email, course.id);
            if (existingEnrollment) {
                setError('هذا البريد الإلكتروني مسجل مسبقاً في هذه الدورة');
                return;
            }

            // Try to sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: validated.email,
                password: validated.password,
                options: {
                    data: {
                        full_name: validated.full_name,
                    },
                },
            });

            // Handle case where user already exists
            if (authError && authError.message.includes('already registered')) {
                // User exists, try to sign in to get user ID
                const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                    email: validated.email,
                    password: validated.password,
                });

                if (signInError) {
                    setError('هذا البريد الإلكتروني مسجل مسبقاً. يرجى التأكد من كلمة المرور');
                    return;
                }

                if (!signInData.user) {
                    setError('فشل التحقق من الحساب');
                    return;
                }

                // Create enrollment for existing user
                await createEnrollment(
                    signInData.user.id,
                    course.id,
                    validated.full_name,
                    validated.email
                );

                onSuccess();
                return;
            }

            if (authError) {
                setError(`خطأ في التسجيل: ${authError.message}`);
                return;
            }

            if (!authData.user) {
                setError('فشل إنشاء الحساب');
                return;
            }

            // Create enrollment record for new user
            await createEnrollment(
                authData.user.id,
                course.id,
                validated.full_name,
                validated.email
            );

            onSuccess();
        } catch (err: any) {
            if (err.errors) {
                // Zod validation errors
                setError(err.errors[0]?.message || 'يرجى التحقق من البيانات المدخلة');
            } else {
                setError(err.message || 'حدث خطأ. يرجى المحاولة مرة أخرى.');
            }
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Existing User Info */}
            {existingUser && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 text-sm flex items-start gap-2">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">لديك حساب مسجل مسبقاً</p>
                        <p className="text-xs mt-1">تم ملء بياناتك تلقائياً. أدخل كلمة المرور للتسجيل في هذه الدورة</p>
                    </div>
                </div>
            )}

            {/* Full Name */}
            <div>
                <Label htmlFor="full_name" className="mb-2">
                    الاسم الكامل
                </Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary dark:text-textSecondary-dark pointer-events-none" />
                    <Input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="pr-10"
                        placeholder="أدخل اسمك الكامل"
                        required
                        disabled={loading || (existingUser && checkingEmail)}
                        readOnly={existingUser}
                    />
                </div>
                {existingUser && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        الاسم المسجل في حسابك
                    </p>
                )}
            </div>

            {/* Email */}
            <div>
                <Label htmlFor="email" className="mb-2">
                    البريد الإلكتروني
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary dark:text-textSecondary-dark pointer-events-none" />
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleEmailBlur}
                        className="pr-10"
                        placeholder="example@email.com"
                        required
                        disabled={loading}
                        dir="ltr"
                    />
                </div>
                {checkingEmail && (
                    <p className="text-xs text-textSecondary dark:text-textSecondary-dark mt-1">
                        جاري التحقق من البريد الإلكتروني...
                    </p>
                )}
            </div>

            {/* Password */}
            <div>
                <Label htmlFor="password" className="mb-2">
                    {existingUser ? 'كلمة المرور الخاصة بحسابك' : 'كلمة المرور'}
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary dark:text-textSecondary-dark pointer-events-none" />
                    <Input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="pr-10"
                        placeholder={existingUser ? "أدخل كلمة المرور" : "8 أحرف على الأقل"}
                        required
                        minLength={8}
                        disabled={loading}
                    />
                </div>
                {existingUser && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        استخدم كلمة المرور التي سجلت بها في الدورة السابقة
                    </p>
                )}
            </div>

            {/* Confirm Password - Hide for existing users */}
            {!existingUser && (
                <div>
                    <Label htmlFor="confirm_password" className="mb-2">
                        تأكيد كلمة المرور
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary dark:text-textSecondary-dark pointer-events-none" />
                        <Input
                            type="password"
                            id="confirm_password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            className="pr-10"
                            placeholder="أعد إدخال كلمة المرور"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <Button
                type="submit"
                className="w-full gap-2"
                size="lg"
                disabled={loading || checkingEmail}
            >
                <UserPlus className="w-5 h-5" />
                {loading ? 'جاري التسجيل...' : existingUser ? 'التسجيل في الدورة' : 'تسجيل في الدورة'}
            </Button>

            {/* Info */}
            <p className="text-sm text-textSecondary dark:text-textSecondary-dark text-center">
                {existingUser ? 'ستتمكن من استخدام نفس البيانات لتسجيل الدخول يومياً' : 'ستحتاج لهذه البيانات لتسجيل الدخول يومياً'}
            </p>
        </form>
    );
};
