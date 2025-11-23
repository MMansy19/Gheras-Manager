'use client';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useRole } from '../hooks/useRole';
import { useDarkMode } from '../hooks/useDarkMode';
import { fetchTeams } from '../api/mockApi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useEffect, useState } from 'react';

export const AppLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { role, setRole } = useRole();
    const { isDark, toggle } = useDarkMode();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { data: teams, isLoading, error } = useQuery({
        queryKey: ['teams'],
        queryFn: fetchTeams,
    });

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

    const handleLogout = () => {
        setRole(null);
        navigate('/');
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
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold mb-2">خطأ في تحميل البيانات</h2>
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
                <svg
                    className="w-6 h-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>

            {/* Sidebar */}
            <aside
                className={`sidebar ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                    } md:translate-x-0 transition-transform duration-300`}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-xl font-bold text-primary mb-1">غراس مدير المهام</h1>
                    <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                        {role === 'admin' && 'مدير النظام'}
                        {role === 'supervisor' && 'مسؤول الفريق'}
                        {role === 'volunteer' && 'متطوع'}
                    </p>
                </div>

                {/* Dark Mode Toggle */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={toggle}
                        className="w-full flex items-center justify-between px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="تبديل الوضع الليلي"
                    >
                        <span>{isDark ? '🌙' : '☀️'}</span>
                        <span className="text-sm">
                            {isDark ? 'الوضع الليلي' : 'الوضع النهاري'}
                        </span>
                    </button>
                </div>

                {/* Teams Navigation */}
                <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
                    <h3 className="text-xs font-bold text-textSecondary dark:text-textSecondary-dark uppercase mb-2">
                        الفرق
                    </h3>
                    <nav className="space-y-1 mb-6">
                        {teams?.map((team) => (
                            <Link
                                key={team.id}
                                to={`/app/team/${team.slug}`}
                                className={
                                    isActiveLink(team.slug)
                                        ? 'sidebar-link-active'
                                        : 'sidebar-link'
                                }
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className="flex-1">{team.name}</span>
                                <span className="badge bg-gray-200 dark:bg-gray-700 text-textPrimary dark:text-textPrimary-dark">
                                    {team.members_count}
                                </span>
                            </Link>
                        ))}
                    </nav>

                    {/* Admin/Supervisor Links */}
                    {isAdminOrSupervisor && (
                        <>
                            <h3 className="text-xs font-bold text-textSecondary dark:text-textSecondary-dark uppercase mb-2">
                                الإدارة
                            </h3>
                            <nav className="space-y-1">
                                <Link
                                    to="/app/users"
                                    className={
                                        isActiveLink('/app/users')
                                            ? 'sidebar-link-active'
                                            : 'sidebar-link'
                                    }
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <span>👥</span>
                                    <span className="flex-1">إدارة المستخدمين</span>
                                </Link>
                                <Link
                                    to="/app/stats"
                                    className={
                                        isActiveLink('/app/stats')
                                            ? 'sidebar-link-active'
                                            : 'sidebar-link'
                                    }
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <span>📊</span>
                                    <span className="flex-1">الإحصائيات</span>
                                </Link>
                            </nav>
                        </>
                    )}
                </div>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="w-full btn-danger flex items-center justify-center gap-2"
                    >
                        <span>🚪</span>
                        <span>تسجيل الخروج</span>
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
            <main className="md:mr-64 min-h-screen">
                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
