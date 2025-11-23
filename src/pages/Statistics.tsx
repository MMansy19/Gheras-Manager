'use client';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchStats } from '../api/mockApi';
import { STATUS_LABELS } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { useRole } from '../hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const Statistics = () => {
    const { role } = useRole();
    const navigate = useNavigate();

    useEffect(() => {
        if (role !== 'admin' && role !== 'supervisor') {
            navigate('/app/team/design');
        }
    }, [role, navigate]);

    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['stats'],
        queryFn: fetchStats,
    });

    if (isLoading) {
        return <LoadingSpinner message="جاري تحميل الإحصائيات..." />;
    }

    if (error) {
        return (
            <EmptyState
                icon="⚠️"
                title="خطأ في تحميل الإحصائيات"
                description="حدث خطأ أثناء تحميل الإحصائيات. يرجى المحاولة مرة أخرى."
                action={{ label: 'إعادة المحاولة', onClick: () => window.location.reload() }}
            />
        );
    }

    if (!stats) {
        return (
            <EmptyState
                icon="📊"
                title="لا توجد بيانات"
                description="لا توجد إحصائيات متاحة حاليًا."
            />
        );
    }

    // Prepare data for charts
    const tasksDistributionData = Object.entries(stats.tasks_distribution).map(([status, count]) => ({
        name: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
        value: count,
    }));

    const COLORS = ['#3b82f6', '#a855f7', '#f59e0b', '#e11d48', '#16a34a', '#6b7280'];

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-1">الإحصائيات</h1>
                <p className="text-textSecondary dark:text-textSecondary-dark">
                    تقارير شاملة عن أداء الفرق والمتطوعين
                </p>
            </div>

            {/* Tasks Distribution */}
            <div className="card mb-6">
                <h2 className="text-xl font-bold mb-4">توزيع المهام حسب الحالة</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={tasksDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {tasksDistributionData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                direction: 'rtl',
                                textAlign: 'right',
                                fontFamily: 'Cairo, sans-serif',
                            }}
                        />
                        <Legend
                            wrapperStyle={{
                                direction: 'rtl',
                                textAlign: 'right',
                                fontFamily: 'Cairo, sans-serif',
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Team Performance */}
            <div className="card mb-6">
                <h2 className="text-xl font-bold mb-4">أداء الفرق</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={stats.team_performance}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="team" type="category" />
                        <Tooltip
                            contentStyle={{
                                direction: 'rtl',
                                textAlign: 'right',
                                fontFamily: 'Cairo, sans-serif',
                            }}
                        />
                        <Legend
                            wrapperStyle={{
                                direction: 'rtl',
                                textAlign: 'right',
                                fontFamily: 'Cairo, sans-serif',
                            }}
                        />
                        <Bar dataKey="completed" fill="#059669" name="المهام المنجزة" />
                        <Bar dataKey="total" fill="#cbd5e1" name="إجمالي المهام" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Member Performance */}
            <div className="card">
                <h2 className="text-xl font-bold mb-4">أداء المتطوعين</h2>
                <div className="overflow-x-auto">
                    {stats.member_performance && stats.member_performance.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>إجمالي الساعات</th>
                                    <th>المهام المنجزة</th>
                                    <th>الاسم</th>
                                    <th>#</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.member_performance.map((member, index) => (
                                    <tr key={member.user_id}>
                                        <td>
                                            <span className="font-medium">{member.total_hours.toFixed(1)} ساعة</span>
                                        </td>
                                        <td>
                                            <span className="badge badge-status-done">
                                                {member.completed_tasks}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="font-semibold">{member.name}</span>
                                        </td>
                                        <td>
                                            <span className="text-textSecondary dark:text-textSecondary-dark">
                                                {index + 1}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState
                            icon="📊"
                            title="لا توجد بيانات"
                            description="لا توجد بيانات أداء للمتطوعين حاليًا."
                        />
                    )}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="card text-center">
                    <div className="text-4xl mb-2">📋</div>
                    <div className="text-3xl font-bold text-primary mb-1">
                        {Object.values(stats.tasks_distribution).reduce((a, b) => a + b, 0)}
                    </div>
                    <div className="text-sm text-textSecondary dark:text-textSecondary-dark">
                        إجمالي المهام
                    </div>
                </div>

                <div className="card text-center">
                    <div className="text-4xl mb-2">✅</div>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                        {stats.tasks_distribution.done || 0}
                    </div>
                    <div className="text-sm text-textSecondary dark:text-textSecondary-dark">
                        المهام المنجزة
                    </div>
                </div>

                <div className="card text-center">
                    <div className="text-4xl mb-2">⏱️</div>
                    <div className="text-3xl font-bold text-amber-600 mb-1">
                        {stats.member_performance
                            .reduce((sum, member) => sum + member.total_hours, 0)
                            .toFixed(0)}
                    </div>
                    <div className="text-sm text-textSecondary dark:text-textSecondary-dark">
                        إجمالي الساعات
                    </div>
                </div>
            </div>
        </div>
    );
};
