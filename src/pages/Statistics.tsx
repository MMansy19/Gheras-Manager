'use client';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, LineChart, Line, AreaChart, Area } from 'recharts';
import { fetchStats } from '../api/mockApi';
import { STATUS_LABELS } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { useRole } from '../hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AlertTriangle, BarChart3, ClipboardList, CheckCircle, Clock, Users, PieChart as PieChartIcon, Target, TrendingUp, Award, Zap } from 'lucide-react';

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
                icon={<AlertTriangle className="w-16 h-16 text-red-500" />}
                title="خطأ في تحميل الإحصائيات"
                description="حدث خطأ أثناء تحميل الإحصائيات. يرجى المحاولة مرة أخرى."
                action={{ label: 'إعادة المحاولة', onClick: () => window.location.reload() }}
            />
        );
    }

    if (!stats) {
        return (
            <EmptyState
                icon={<BarChart3 className="w-16 h-16 text-gray-400" />}
                title="لا توجد بيانات"
                description="لا توجد إحصائيات متاحة حاليًا."
            />
        );
    }

    // Prepare data for charts
    const tasksDistributionData = Object.entries(stats.tasks_distribution).map(([status, count]) => ({
        name: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
        value: count,
        status,
    }));

    const COLORS = ['#3b82f6', '#a855f7', '#f59e0b', '#e11d48', '#16a34a', '#6b7280'];

    const totalTasks = Object.values(stats.tasks_distribution).reduce((a, b) => a + b, 0);
    const completedTasks = stats.tasks_distribution.done || 0;
    const totalHours = stats.member_performance.reduce((sum, member) => sum + member.total_hours, 0);
    const totalMembers = stats.member_performance.length;
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

    // Additional chart data preparations
    // Top 5 performers for radial chart
    const topPerformers = [...stats.member_performance]
        .sort((a, b) => b.completed_tasks - a.completed_tasks)
        .slice(0, 5)
        .map((member, index) => ({
            name: member.name,
            tasks: member.completed_tasks,
            fill: COLORS[index % COLORS.length],
        }));

    // Team efficiency (tasks completed vs total hours)
    const teamEfficiency = stats.team_performance.map(team => ({
        team: team.team,
        efficiency: team.completed > 0 ? (team.completed / team.total * 100).toFixed(1) : 0,
        completed: team.completed,
        total: team.total,
    }));

    // Hours distribution by members (top 8)
    const hoursDistribution = [...stats.member_performance]
        .sort((a, b) => b.total_hours - a.total_hours)
        .slice(0, 8)
        .map(member => ({
            name: member.name.split(' ')[0], // First name only for better display
            hours: member.total_hours,
            tasks: member.completed_tasks,
        }));

    // Progress circle data for completion rate
    const completionRateNum = typeof completionRate === 'string' ? parseFloat(completionRate) : completionRate;
    const progressData = [
        {
            name: 'مكتمل',
            value: completionRateNum,
            fill: '#16a34a',
        },
        {
            name: 'متبقي',
            value: 100 - completionRateNum,
            fill: '#e5e7eb',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">الإحصائيات</h1>
                <p className="text-textSecondary dark:text-textSecondary-dark">
                    تقارير شاملة عن أداء الفرق والأعضاء
                </p>
            </div>

            {/* Summary Cards - Top Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark mb-1">
                                إجمالي المهام
                            </p>
                            <h3 className="text-3xl font-bold text-primary">{totalTasks}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <ClipboardList className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                </div>

                <div className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark mb-1">
                                المهام المنجزة
                            </p>
                            <h3 className="text-3xl font-bold text-green-600">{completedTasks}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark mb-1">
                                إجمالي الساعات
                            </p>
                            <h3 className="text-3xl font-bold text-amber-600">{totalHours.toFixed(0)}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>

                <div className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-textSecondary dark:text-textSecondary-dark mb-1">
                                معدل الإنجاز
                            </p>
                            <h3 className="text-3xl font-bold text-blue-600">{completionRate}%</h3>
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <Target className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Tasks Distribution - Pie Chart */}
                <div className="card hover:shadow-lg transition-shadow">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                            <PieChartIcon className="h-5 w-5 text-primary" />
                            توزيع المهام حسب الحالة
                        </h2>
                        <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                            نظرة شاملة على حالات المهام
                        </p>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={tasksDistributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
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
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
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

                {/* Team Performance - Bar Chart */}
                <div className="card hover:shadow-lg transition-shadow">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                            <BarChart3 className="h-5 w-5 text-green-600" />
                            أداء الفرق
                        </h2>
                        <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                            مقارنة أداء الفرق المختلفة
                        </p>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                            data={stats.team_performance}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis type="number" />
                            <YAxis dataKey="team" type="category" width={80} />
                            <Tooltip
                                contentStyle={{
                                    direction: 'rtl',
                                    textAlign: 'right',
                                    fontFamily: 'Cairo, sans-serif',
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend
                                wrapperStyle={{
                                    direction: 'rtl',
                                    textAlign: 'right',
                                    fontFamily: 'Cairo, sans-serif',
                                }}
                            />
                            <Bar dataKey="completed" fill="#16a34a" name="المهام المنجزة" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="total" fill="#94a3b8" name="إجمالي المهام" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* New Advanced Charts Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Completion Rate - Radial Progress */}
                <div className="card hover:shadow-lg transition-shadow">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                            <Target className="h-5 w-5 text-blue-600" />
                            معدل الإنجاز الإجمالي
                        </h2>
                        <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                            نسبة المهام المكتملة من الإجمالي
                        </p>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={progressData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                            >
                                {progressData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center -mt-8">
                        <div className="text-4xl font-bold text-green-600">{completionRate}%</div>
                        <p className="text-sm text-textSecondary dark:text-textSecondary-dark mt-1">
                            {completedTasks} من {totalTasks} مهمة
                        </p>
                    </div>
                </div>

                {/* Top Performers - Radial Bar Chart */}
                <div className="card hover:shadow-lg transition-shadow">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                            <Award className="h-5 w-5 text-amber-600" />
                            أفضل 5 أعضاء
                        </h2>
                        <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                            الأعضاء الأكثر إنجازاً للمهام
                        </p>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="20%"
                            outerRadius="90%"
                            data={topPerformers}
                            startAngle={180}
                            endAngle={0}
                        >
                            <RadialBar
                                background
                                dataKey="tasks"
                                cornerRadius={10}
                            />
                            <Legend
                                iconSize={10}
                                layout="vertical"
                                verticalAlign="middle"
                                align="left"
                                wrapperStyle={{
                                    direction: 'rtl',
                                    textAlign: 'right',
                                    fontFamily: 'Cairo, sans-serif',
                                    fontSize: '12px',
                                }}
                            />
                            <Tooltip
                                contentStyle={{
                                    direction: 'rtl',
                                    textAlign: 'right',
                                    fontFamily: 'Cairo, sans-serif',
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                }}
                                formatter={(value) => [`${value} مهمة`, 'المهام المنجزة']}
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                </div>

                {/* Team Efficiency - Line Chart */}
                <div className="card hover:shadow-lg transition-shadow">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                            كفاءة الفرق
                        </h2>
                        <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                            نسبة الإنجاز لكل فريق
                        </p>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={teamEfficiency} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis
                                dataKey="team"
                                tick={{ fontSize: 12 }}
                                angle={-15}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fontSize: 12 }}
                                label={{ value: '%', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    direction: 'rtl',
                                    textAlign: 'right',
                                    fontFamily: 'Cairo, sans-serif',
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                }}
                                formatter={(value) => [`${value}%`, 'نسبة الإنجاز']}
                            />
                            <Line
                                type="monotone"
                                dataKey="efficiency"
                                stroke="#a855f7"
                                strokeWidth={3}
                                dot={{ fill: '#a855f7', r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Hours Distribution - Area Chart */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="card hover:shadow-lg transition-shadow">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                            <Clock className="h-5 w-5 text-amber-600" />
                            توزيع ساعات العمل
                        </h2>
                        <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                            أعلى 8 أعضاء من حيث ساعات العمل
                        </p>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={hoursDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12 }}
                                angle={-15}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    direction: 'rtl',
                                    textAlign: 'right',
                                    fontFamily: 'Cairo, sans-serif',
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                }}
                                formatter={(value, name) => [
                                    `${value} ${name === 'hours' ? 'ساعة' : 'مهمة'}`,
                                    name === 'hours' ? 'الساعات' : 'المهام'
                                ]}
                            />
                            <Area
                                type="monotone"
                                dataKey="hours"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorHours)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Workload Balance - Scatter Bar Chart */}
                <div className="card hover:shadow-lg transition-shadow">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                            <Zap className="h-5 w-5 text-indigo-600" />
                            توازن أحمال العمل
                        </h2>
                        <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                            نسبة المهام إلى الساعات لكل عضو
                        </p>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={hoursDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12 }}
                                angle={-15}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    direction: 'rtl',
                                    textAlign: 'right',
                                    fontFamily: 'Cairo, sans-serif',
                                    backgroundColor: 'hsl(var(--card))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                }}
                            />
                            <Legend
                                wrapperStyle={{
                                    direction: 'rtl',
                                    textAlign: 'right',
                                    fontFamily: 'Cairo, sans-serif',
                                }}
                            />
                            <Bar yAxisId="left" dataKey="tasks" fill="#6366f1" name="المهام" radius={[4, 4, 0, 0]} />
                            <Bar yAxisId="right" dataKey="hours" fill="#ec4899" name="الساعات" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Member Performance Table */}
            <div className="card hover:shadow-lg transition-shadow">
                <div className="mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                        <Users className="h-5 w-5 text-purple-600" />
                        أداء الأعضاء
                    </h2>
                    <p className="text-sm text-textSecondary dark:text-textSecondary-dark">
                        قائمة تفصيلية بأداء جميع الأعضاء ({totalMembers} عضو)
                    </p>
                </div>
                <div className="overflow-x-auto">
                    {stats.member_performance && stats.member_performance.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="w-16">#</th>
                                    <th>الاسم</th>
                                    <th className="text-center">المهام المنجزة</th>
                                    <th className="text-center">إجمالي الساعات</th>
                                    <th className="text-center">متوسط الساعات/مهمة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.member_performance.map((member, index) => {
                                    const avgHours = member.completed_tasks > 0
                                        ? (member.total_hours / member.completed_tasks).toFixed(1)
                                        : '0';
                                    return (
                                        <tr key={member.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td>
                                                <div className="flex items-center justify-center">
                                                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="font-semibold text-base">{member.name}</span>
                                            </td>
                                            <td className="text-center">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                                                    {member.completed_tasks}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className="font-medium text-amber-600 dark:text-amber-400">
                                                    {member.total_hours.toFixed(1)} ساعة
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className="text-textSecondary dark:text-textSecondary-dark">
                                                    {avgHours} ساعة
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <EmptyState
                            icon={<Users className="w-16 h-16 text-gray-400" />}
                            title="لا توجد بيانات"
                            description="لا توجد بيانات أداء للأعضاء حاليًا."
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
