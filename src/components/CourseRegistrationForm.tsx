import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { createEnrollment, getCourseById } from '../api/courseApi';
import { CourseRegistrationInput, CourseRegistrationSchema } from '../types';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
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
            const validated = CourseRegistrationSchema.parse(formData);

            // Get course by ID
            const course = await getCourseById(courseId);
            if (!course) {
                setError('لا توجد دورة بهذا المعرف');
                return;
            }

            // Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: validated.email,
                password: validated.password,
                options: {
                    data: {
                        full_name: validated.full_name,
                    },
                },
            });

            if (authError) {
                if (authError.message.includes('already registered')) {
                    setError('هذا البريد الإلكتروني مسجل مسبقاً');
                } else {
                    setError(`خطأ في التسجيل: ${authError.message}`);
                }
                return;
            }

            if (!authData.user) {
                setError('فشل إنشاء الحساب');
                return;
            }

            // Create enrollment record
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
                        disabled={loading}
                    />
                </div>
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
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary dark:text-textSecondary-dark pointer-events-none" />
                    <Input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="pr-10"
                        placeholder="8 أحرف على الأقل"
                        required
                        minLength={8}
                        disabled={loading}
                    />
                </div>
            </div>

            {/* Confirm Password */}
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
                disabled={loading}
            >
                <UserPlus className="w-5 h-5" />
                {loading ? 'جاري التسجيل...' : 'تسجيل في الدورة'}
            </Button>

            {/* Info */}
            <p className="text-sm text-textSecondary dark:text-textSecondary-dark text-center">
                ستحتاج لهذه البيانات لتسجيل الدخول يومياً
            </p>
        </form>
    );
};
