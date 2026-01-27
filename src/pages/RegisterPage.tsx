import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, ArrowLeft, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Team } from '../api/types';
import { createUser } from '../api/userApi';
import { getTeams } from '../api/teamApi';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'volunteer' as 'admin' | 'supervisor' | 'volunteer',
    status: true,
    telegram_id: '',
    job_title: '',
    weekly_hours: '',
    teams: [] as number[],
  });

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'admin') {
      navigate('/login');
      return;
    }

    // Load teams
    loadTeams();
  }, [user, navigate]);

  const loadTeams = async () => {
    try {
      const response = await getTeams({ limit: 100 });
      setTeams(response.data);
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
          ? Number(value)
          : value,
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleTeamToggle = (teamId: number) => {
    setFormData({
      ...formData,
      teams: formData.teams.includes(teamId)
        ? formData.teams.filter((id) => id !== teamId)
        : [...formData.teams, teamId],
    });
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'الاسم مطلوب';
    if (!formData.email.trim()) return 'البريد الإلكتروني مطلوب';
    if (!formData.password) return 'كلمة المرور مطلوبة';
    if (formData.password.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    if (formData.password !== formData.password_confirmation)
      return 'كلمتا المرور غير متطابقتين';
    if (!formData.email.includes('@')) return 'البريد الإلكتروني غير صالح';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role,
        status: formData.status,
        telegram_id: formData.telegram_id.trim() || undefined,
        job_title: formData.job_title.trim() || undefined,
        weekly_hours: formData.weekly_hours ? Number(formData.weekly_hours) : undefined,
        teams: formData.teams,
      };

      await createUser(userData);

      setSuccess('تم إنشاء المستخدم بنجاح!');
      setTimeout(() => {
        navigate('/app/users');
      }, 1500);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.error?.message || 'فشل في إنشاء المستخدم');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir="rtl">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-xl p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg ml-4">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">إنشاء مستخدم جديد</h1>
                <p className="text-gray-600">إضافة مستخدم جديد إلى النظام</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/app/users')}
              disabled={loading}
            >
              <X className="w-4 h-4 ml-2" />
              إلغاء
            </Button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">الاسم *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="أحمد محمد"
                  disabled={loading}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@ghras.com"
                  disabled={loading}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {/* Password and Confirmation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">كلمة المرور *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password_confirmation">تأكيد كلمة المرور *</Label>
                <Input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {/* Role and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">الدور *</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="volunteer">عضو</option>
                  <option value="supervisor">مسؤول</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
              <div className="flex items-center mt-8">
                <input
                  id="status"
                  name="status"
                  type="checkbox"
                  checked={formData.status}
                  onChange={handleChange}
                  disabled={loading}
                  className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="status">حساب نشط</Label>
              </div>
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telegram_id">معرف التليجرام</Label>
                <Input
                  id="telegram_id"
                  name="telegram_id"
                  type="text"
                  value={formData.telegram_id}
                  onChange={handleChange}
                  placeholder="@username"
                  disabled={loading}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="job_title">المسمى الوظيفي</Label>
                <Input
                  id="job_title"
                  name="job_title"
                  type="text"
                  value={formData.job_title}
                  onChange={handleChange}
                  placeholder="مطور ويب"
                  disabled={loading}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="weekly_hours">الساعات الأسبوعية</Label>
              <Input
                id="weekly_hours"
                name="weekly_hours"
                type="number"
                value={formData.weekly_hours}
                onChange={handleChange}
                placeholder="40"
                disabled={loading}
                min="0"
                max="168"
                className="mt-1"
              />
            </div>

            {/* Teams Selection */}
            {teams.length > 0 && (
              <div>
                <Label>الفرق</Label>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className={`p-3 border rounded-lg cursor-pointer transition ${
                        formData.teams.includes(team.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handleTeamToggle(team.id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.teams.includes(team.id)}
                          onChange={() => handleTeamToggle(team.id)}
                          className="ml-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {team.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                    جاري الإنشاء...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <UserPlus className="w-5 h-5 ml-2" />
                    إنشاء المستخدم
                  </div>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/app/users')}
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
