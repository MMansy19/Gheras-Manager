'use client';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../hooks/useRole';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, ROLE_LABELS } from '../types';
import { ShieldCheck, UserCheck, UserCog, Info, Lock } from 'lucide-react';

export const RoleSelection = () => {
    const navigate = useNavigate();
    const { setRole } = useRole();
    const { login } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        setError('');
    };

    const handleBack = () => {
        setSelectedRole(null);
        setPassword('');
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const success = await login(password);

            if (success) {
                setRole(selectedRole);
                navigate('/app', { replace: true });
            } else {
                setError('كلمة المرور غير صحيحة');
            }
        } catch (err) {
            setError('حدث خطأ. يرجى المحاولة مرة أخرى.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    const roles: { role: UserRole; icon: typeof ShieldCheck; description: string }[] = [
        {
            role: 'admin',
            icon: ShieldCheck,
            description: 'إدارة كاملة للنظام والمستخدمين',
        },
        {
            role: 'supervisor',
            icon: UserCog,
            description: 'إدارة المهام والمستخدمين',
        },
        {
            role: 'volunteer',
            icon: UserCheck,
            description: 'إدارة المهام الخاصة',
        },
    ];

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 p-4 relative"
        >
            {/* Background Image with Lazy Loading */}
            <img
                src="/home-bg.webp"
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
                aria-hidden="true"
            />

            {/* Overlay for better readability */}
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/90 backdrop-blur-sm"></div>

            <div className="max-w-4xl w-full relative z-10">
                <div className="text-center mb-12">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <img
                            src="/logo.png"
                            alt="شعار غراس"
                            fetchPriority="high"
                            width="128"
                            height="128"
                            className="h-24 w-24 md:h-32 md:w-32 object-contain drop-shadow-lg"
                        />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black mb-4 text-primary drop-shadow-md">
                        غراس مدير المهام
                    </h1>
                    <p className="text-lg text-textSecondary dark:text-textSecondary-dark font-semibold">
                        نظام إدارة المهام لفرق أكاديمية غراس العلم
                    </p>
                </div>

                <div className="card mb-6">
                    {!selectedRole ? (
                        <>
                            <h2 className="text-2xl font-bold mb-6 text-center">
                                اختر دورك للمتابعة
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {roles.map(({ role, icon: Icon, description }) => (
                                    <button
                                        key={role}
                                        onClick={() => handleRoleSelect(role)}
                                        className="card-hover text-center p-6 group transition-all"
                                    >
                                        <div className="mb-3 flex justify-center">
                                            <Icon className="w-16 h-16 text-primary group-hover:text-primary-dark transition-colors" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                                            {ROLE_LABELS[role]}
                                        </h3>
                                        <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                                            {description}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="max-w-md mx-auto">
                            <h2 className="text-2xl font-bold mb-6 text-center">
                                تسجيل الدخول كـ {ROLE_LABELS[selectedRole]}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                                        كلمة المرور
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-textSecondary dark:text-textSecondary-dark" />
                                        <input
                                            type="password"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pr-10 pl-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-surface dark:bg-surface-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            placeholder="أدخل كلمة المرور"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex-1 btn-secondary"
                                        disabled={loading}
                                    >
                                        رجوع
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <div className="text-center text-sm text-textSecondary dark:text-textSecondary-dark">
                    <p className="flex items-center justify-center gap-2">
                        <Info className="w-4 h-4" />
                        هذا نظام تجريبي يستخدم بيانات وهمية لأغراض التطوير
                    </p>
                </div>
            </div>
        </div>
    );
};
