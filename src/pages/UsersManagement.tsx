'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { fetchUsers,  updateUser, deleteUser, fetchTeams } from '../api/mockApi';
import { User, ROLE_LABELS } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useRole } from '../hooks/useRole';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AlertTriangle, Plus, Search, Users, Trash2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
    Table, 
    TableHeader, 
    TableBody, 
    TableRow, 
    TableHead, 
    TableCell,
    TableActions,
    TableBadge,
    TablePagination
} from '../components/ui/table';

export const UsersManagement = () => {
    const { role } = useRole();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTeamId, setFilterTeamId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    useEffect(() => {
        if (role !== 'admin' && role !== 'supervisor') {
            navigate('/app/team/design');
        }
    }, [role, navigate]);

    const { data: users, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });

    const { data: teams } = useQuery({
        queryKey: ['teams'],
        queryFn: fetchTeams,
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
            updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('تم تحديث المستخدم بنجاح');
        },
        onError: () => {
            toast.error('فشل تحديث المستخدم');
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('تم حذف المستخدم بنجاح');
        },
        onError: () => {
            toast.error('فشل حذف المستخدم');
        },
    });

    const toggleUserStatus = (user: User) => {
        updateUserMutation.mutate({
            id: user.id,
            data: { status: !user.status },
        });
    };

    const filteredUsers = users?.filter(
        (user) => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTeam = filterTeamId === null || user.teams.includes(filterTeamId);
            return matchesSearch && matchesTeam;
        }
    );

    // Pagination logic
    const paginatedUsers = filteredUsers ? filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    ) : [];
    const totalPages = filteredUsers ? Math.ceil(filteredUsers.length / itemsPerPage) : 0;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (perPage: number) => {
        setItemsPerPage(perPage);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    if (isLoading) {
        return <LoadingSpinner message="جاري تحميل المستخدمين..." />;
    }

    if (error) {
        return (
            <EmptyState
                icon={<AlertTriangle className="w-16 h-16 text-red-500" />}
                title="خطأ في تحميل المستخدمين"
                description="حدث خطأ أثناء تحميل المستخدمين. يرجى المحاولة مرة أخرى."
                action={{ label: 'إعادة المحاولة', onClick: () => window.location.reload() }}
            />
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row-reverse items-start sm:items-center justify-between gap-4">
                <button
                    onClick={() => navigate('/register')}
                    className="btn-primary flex items-center gap-2"
                    disabled={role !== 'admin'}
                    title={role !== 'admin' ? 'فقط المديرين يمكنهم إنشاء مستخدمين' : 'إنشاء مستخدم جديد'}
                >
                    <Plus className="w-5 h-5" />
                    إضافة مستخدم
                </button>
                <div>
                    <h1 className="text-3xl font-bold mb-1">إدارة المستخدمين</h1>
                    <p className="text-textSecondary dark:text-textSecondary-dark">
                        إدارة حسابات المستخدمين والصلاحيات
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="البحث عن مستخدم (الاسم أو البريد الإلكتروني)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10"
                        />
                    </div>
                    <div>
                        <Select
                            value={filterTeamId?.toString() || 'all'}
                            onValueChange={(value) => setFilterTeamId(value === 'all' ? null : parseInt(value))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="تصفية حسب الفريق" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">جميع الفرق</SelectItem>
                                {teams?.map((team) => (
                                    <SelectItem key={team.id} value={team.id.toString()}>
                                        {team.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            {filteredUsers && filteredUsers.length > 0 ? (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow hoverable={false}>
                                <TableHead>الاسم</TableHead>
                                <TableHead>البريد الإلكتروني</TableHead>
                                <TableHead>الدور</TableHead>
                                <TableHead>الفرق</TableHead>
                                <TableHead>الحالة</TableHead>
                                <TableHead>الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <span className="font-semibold">{user.name}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-textSecondary dark:text-textSecondary-dark">
                                        {user.email}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium">{ROLE_LABELS[user.role]}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap justify-start">
                                        {user.teams.map((teamId) => (
                                            <TableBadge key={teamId} variant="primary">
                                                {teamId}
                                            </TableBadge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <button
                                        onClick={() => toggleUserStatus(user)}
                                        className={`badge ${user.status
                                            ? 'badge-status-done'
                                            : 'badge-status-issue'
                                            }`}
                                    >
                                        {user.status ? 'نشط' : 'معطل'}
                                    </button>
                                </TableCell>
                                <TableCell>
                                    <TableActions>
                                        <button
                                            onClick={() => setUserToDelete(user)}
                                            className="text-sm bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 py-1 px-2 rounded-md flex items-center gap-1 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            حذف
                                        </button>
                                    </TableActions>
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredUsers.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                    />
                </>
            ) : (
                <EmptyState
                    icon={<Users className="w-16 h-16 text-gray-400" />}
                    title="لا يوجد مستخدمون"
                    description="لم يتم العثور على مستخدمين. جرب البحث بكلمات أخرى."
                />
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={() => {
                    if (userToDelete) {
                        deleteUserMutation.mutate(userToDelete.id);
                    }
                }}
                title="تأكيد حذف المستخدم"
                message={`هل أنت متأكد من حذف المستخدم "${userToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
                confirmText="حذف"
                cancelText="إلغاء"
            />
        </div>
    );
};
