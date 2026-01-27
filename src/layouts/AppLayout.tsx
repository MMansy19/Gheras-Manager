'use client';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useRole } from '../hooks/useRole';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useEffect, useState } from 'react';
import { AlertTriangle, Moon, Sun, Users, BarChart3, LogOut, User, Menu, X, ChevronLeft, ChevronRight, Calendar, UserPlus } from 'lucide-react';

export const AppLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { role } = useRole();
    const { logout, user } = useAuth();
    const { isDark, toggle } = useDarkMode();
    const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state

    // Initialize collapsed state from localStorage
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
    });

    // Save collapsed state to localStorage
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
    }, [sidebarCollapsed]);

    const { data: projects, isLoading: projectsLoading, error } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const { fetchProjects } = await import('../api/projectApi');
            return fetchProjects();
        },
    });

    const isLoading = projectsLoading;
    const activeProjects = projects?.filter(p => p.active);

    // Check for role - wait a bit to ensure localStorage is synced
    useEffect(() => {
        const checkRole = () => {
            const storedRole = localStorage.getItem('userRole');
            console.log('AppLayout check - role state:', role, 'localStorage:', storedRole);

            if (!storedRole) {
                console.log('No role in localStorage, redirecting to home');
                navigate('/', { replace: true });
            }
        };

        // Small delay to allow localStorage to sync from Home page
        const timer = setTimeout(checkRole, 100);
        return () => clearTimeout(timer);
    }, []); // Empty dependency array - only run once on mount

    const handleLogout = async () => {
        await logout();
        // navigate('/login', { replace: true });
        navigate('/admin/select-role', { replace: true });
    };

    const isAdminOrSupervisor = role === 'admin' || role === 'supervisor';

    const isActiveLink = (path: string) => {
        return location.pathname.includes(path);
    };

    if (isLoading) {
        return <LoadingSpinner message="جاري تحميل البيانات..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="card max-w-md text-center">
                    <div className="flex justify-center mb-4">
                        <AlertTriangle className="w-16 h-16 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold mb-1">خطأ في تحميل البيانات</h2>
                    <p className="text-textSecondary dark:text-textSecondary-dark mb-4">
                        {error instanceof Error ? error.message : 'حدث خطأ غير متوقع'}
                    </p>
                    <button onClick={() => window.location.reload()} className="btn-primary">
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background dark:bg-background-dark" dir="rtl">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-surface dark:bg-surface-dark rounded-md shadow-lg"
                aria-label="القائمة"
            >
                {sidebarOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <Menu className="w-6 h-6" />
                )}
            </button>

            {/* Sidebar */}
            <aside
                className={`
                    w-64
                    ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}
                    ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
                    md:translate-x-0
                    bg-surface dark:bg-surface-dark border-l border-gray-200 dark:border-gray-700
                    h-screen fixed top-0 right-0 flex flex-col shadow-lg z-40
                    transition-all duration-300 ease-in-out
                `}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <Link
                        to="/app"
                        className={`flex items-center gap-3 mb-1 hover:opacity-80 transition-opacity ${sidebarCollapsed ? 'md:justify-center' : ''
                            }`}
                    >
                        <img
                            src="/logo.png"
                            alt="شعار غراس"
                            loading="lazy"
                            width="40"
                            height="40"
                            className="h-10 w-10 object-contain flex-shrink-0"
                        />
                        <h1 className={`-mb-1 text-xl font-bold text-primary whitespace-nowrap overflow-hidden ${sidebarCollapsed ? 'md:hidden' : ''}`}>
                            غراس مدير المهام
                        </h1>
                    </Link>
                    {user && (
                        <div className={`text-center ${sidebarCollapsed ? 'md:hidden' : ''}`}>
                            <p className="text-sm font-medium text-textPrimary dark:text-textPrimary-dark">
                                {user.name}
                            </p>
                            <p className="text-xs text-textSecondary dark:text-textSecondary-dark">
                                {role === 'admin' && 'مدير النظام'}
                                {role === 'supervisor' && 'مسؤول الفريق'}
                                {role === 'volunteer' && 'عضو'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Dark Mode Toggle */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={toggle}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors justify-between ${sidebarCollapsed ? 'md:justify-center' : ''
                            }`}
                        aria-label="تبديل الوضع الليلي"
                        title={isDark ? 'الوضع الليلي' : 'الوضع النهاري'}
                    >
                        {isDark ? <Moon className="w-5 h-5 flex-shrink-0" /> : <Sun className="w-5 h-5 flex-shrink-0" />}
                        <span className={`text-sm ${sidebarCollapsed ? 'md:hidden' : ''}`}>
                            {isDark ? 'الوضع الليلي' : 'الوضع النهاري'}
                        </span>
                    </button>
                </div>

                {/* Projects Navigation */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
                    <h3 className={`text-xs font-bold text-textSecondary dark:text-textSecondary-dark uppercase mb-1 ${sidebarCollapsed ? 'md:hidden' : ''
                        }`}>
                        المشاريع
                    </h3>
                    <nav className="space-y-1 mb-4 max-h-[30vh] overflow-y-auto scrollbar-thin">
                        {activeProjects?.map((project) => (
                            <Link
                                key={project.id}
                                to={`/app/project/${project.id}`}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-right
                                    ${isActiveLink(`/app/project/${project.id}`)
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-textPrimary dark:text-textPrimary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }
                                    ${sidebarCollapsed ? 'md:justify-center' : ''}
                                `}
                                onClick={() => setSidebarOpen(false)}
                                title={sidebarCollapsed ? project.name : ''}
                            >
                                <div className={`w-2 h-2 rounded-full ${project.active ? 'bg-green-500' : 'bg-gray-400'
                                    } flex-shrink-0`} />
                                <span className={`flex-1 truncate ${sidebarCollapsed ? 'md:hidden' : ''}`}>{project.name}</span>
                            </Link>
                        ))}
                    </nav>


                    {/* Admin/Supervisor Links */}
                    {isAdminOrSupervisor && (
                        <>
                            <h3 className={`text-xs font-bold text-textSecondary dark:text-textSecondary-dark uppercase mb-1 ${sidebarCollapsed ? 'md:hidden' : ''
                                }`}>
                                الإدارة
                            </h3>
                            <nav className="space-y-1">
                                <Link
                                    to="/app/users"
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-right
                                        ${isActiveLink('/app/users')
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-textPrimary dark:text-textPrimary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }
                                        ${sidebarCollapsed ? 'md:justify-center' : ''}
                                    `}
                                    onClick={() => setSidebarOpen(false)}
                                    title={sidebarCollapsed ? 'إدارة المستخدمين' : ''}
                                >
                                    <Users className="w-5 h-5 flex-shrink-0" />
                                    <span className={`flex-1 ${sidebarCollapsed ? 'md:hidden' : ''
                                        }`}>إدارة المستخدمين</span>
                                </Link>
                                {/* {role === 'admin' && ( */}
                                    <Link
                                        to="/register"
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-right
                                            ${isActiveLink('/register')
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-textPrimary dark:text-textPrimary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }
                                            ${sidebarCollapsed ? 'md:justify-center' : ''}
                                        `}
                                        onClick={() => setSidebarOpen(false)}
                                        title={sidebarCollapsed ? 'إنشاء مستخدم' : ''}
                                    >
                                        <UserPlus className="w-5 h-5 flex-shrink-0" />
                                        <span className={`flex-1 ${sidebarCollapsed ? 'md:hidden' : ''
                                            }`}>إنشاء مستخدم</span>
                                    </Link>
                                {/* )} */}
                                <Link
                                    to="/app/stats"
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-right
                                        ${isActiveLink('/app/stats')
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-textPrimary dark:text-textPrimary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }
                                        ${sidebarCollapsed ? 'md:justify-center' : ''}
                                    `}
                                    onClick={() => setSidebarOpen(false)}
                                    title={sidebarCollapsed ? 'الإحصائيات' : ''}
                                >
                                    <BarChart3 className="w-5 h-5 flex-shrink-0" />
                                    <span className={`flex-1 ${sidebarCollapsed ? 'md:hidden' : ''
                                        }`}>الإحصائيات</span>
                                </Link>
                                {role === 'admin' && (
                                    <Link
                                        to="/app/courses"
                                        className={`
                                            flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-right
                                            ${isActiveLink('/app/courses')
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-textPrimary dark:text-textPrimary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }
                                            ${sidebarCollapsed ? 'md:justify-center' : ''}
                                        `}
                                        onClick={() => setSidebarOpen(false)}
                                        title={sidebarCollapsed ? 'إدارة الدورات' : ''}
                                    >
                                        <Calendar className="w-5 h-5 flex-shrink-0" />
                                        <span className={`flex-1 ${sidebarCollapsed ? 'md:hidden' : ''
                                            }`}>إدارة الدورات</span>
                                    </Link>
                                )}
                            </nav>
                        </>
                    )}
                    {/* User Profile Links */}
                    <h3 className={`mt-4 text-xs font-bold text-textSecondary dark:text-textSecondary-dark uppercase mb-1 ${sidebarCollapsed ? 'md:hidden' : ''
                        }`}>
                        الملف الشخصي
                    </h3>

                    <nav className="space-y-1">
                        <Link
                            to="/app/profile"
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-right
                                ${isActiveLink('/app/profile')
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-textPrimary dark:text-textPrimary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                                }
                                ${sidebarCollapsed ? 'md:justify-center' : ''}
                            `}
                            onClick={() => setSidebarOpen(false)}
                            title={sidebarCollapsed ? 'ملفي الشخصي' : ''}
                        >
                            <User className="w-5 h-5 flex-shrink-0" />
                            <span className={`flex-1 ${sidebarCollapsed ? 'md:hidden' : ''
                                }`}>ملفي الشخصي</span>
                        </Link>
                    </nav>
                </div>

                {/* Desktop Collapse Toggle Button */}
                <div className="hidden md:block p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${sidebarCollapsed ? 'justify-center' : 'justify-between'
                            }`}
                        aria-label={sidebarCollapsed ? "توسيع القائمة" : "إغلاق القائمة"}
                        title={sidebarCollapsed ? "توسيع القائمة" : "إغلاق القائمة"}
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <>
                                <span className="text-sm">إغلاق القائمة</span>
                                <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                            </>
                        )}
                    </button>
                </div>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className={`w-full btn-danger flex items-center gap-2 justify-center ${sidebarCollapsed ? 'md:px-2' : ''
                            }`}
                        title={sidebarCollapsed ? 'تسجيل الخروج' : ''}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span className={sidebarCollapsed ? 'md:hidden' : ''}>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <main className={`
                ${sidebarCollapsed ? 'md:mr-20' : 'md:mr-64'}
                min-h-screen transition-all duration-300
            `}>
                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
