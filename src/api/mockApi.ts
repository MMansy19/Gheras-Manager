import {
  Team,
  User,
  Task,
  Stats,
  CreateTaskInput,
  UpdateTaskInput,
  CreateUserInput,
  TeamSchema,
  UserSchema,
  TaskSchema,
  StatsSchema,
} from '../types';

// Mock Data - Teams
const MOCK_TEAMS: Team[] = [
  { id: 1, name: 'إبداع (تصميم)', slug: 'design', members_count: 8 },
  { id: 2, name: 'سوشيال ميديا', slug: 'social', members_count: 6 },
  { id: 3, name: 'تقني', slug: 'tech', members_count: 5 },
  { id: 4, name: 'تلجرام', slug: 'telegram', members_count: 4 },
  { id: 5, name: 'محتوى', slug: 'content', members_count: 7 },
];

// Mock Data - Users
let MOCK_USERS: User[] = [
  {
    id: 1,
    name: 'أحمد محمد',
    email: 'ahmad@ghras.com',
    role: 'admin',
    status: true,
    telegram_id: '@ahmad',
    job_title: 'مطور ويب',
    weekly_hours: 15,
    teams: [1, 3],
  },
  {
    id: 2,
    name: 'فاطمة أحمد',
    email: 'fatima@ghras.com',
    role: 'supervisor',
    status: true,
    telegram_id: '@fatima',
    job_title: 'مصممة جرافيك',
    weekly_hours: 10,
    teams: [1],
  },
  {
    id: 3,
    name: 'يوسف علي',
    email: 'youssef@ghras.com',
    role: 'volunteer',
    status: true,
    telegram_id: '@youssef',
    job_title: 'كاتب محتوى',
    weekly_hours: 8,
    teams: [5],
  },
  {
    id: 4,
    name: 'مريم حسن',
    email: 'maryam@ghras.com',
    role: 'volunteer',
    status: true,
    telegram_id: '@maryam',
    job_title: 'مسوقة إلكترونية',
    weekly_hours: 12,
    teams: [2],
  },
  {
    id: 5,
    name: 'عمر خالد',
    email: 'omar@ghras.com',
    role: 'volunteer',
    status: true,
    telegram_id: '@omar',
    job_title: 'مدير مجموعات',
    weekly_hours: 6,
    teams: [4],
  },
  {
    id: 6,
    name: 'نور الدين',
    email: 'nour@ghras.com',
    role: 'supervisor',
    status: true,
    telegram_id: '@nour',
    job_title: 'مبرمج',
    weekly_hours: 20,
    teams: [3],
  },
  {
    id: 7,
    name: 'سارة عبدالله',
    email: 'sara@ghras.com',
    role: 'volunteer',
    status: false,
    telegram_id: '@sara',
    job_title: 'محررة فيديو',
    weekly_hours: 0,
    teams: [1],
  },
  {
    id: 8,
    name: 'خالد إبراهيم',
    email: 'khaled@ghras.com',
    role: 'volunteer',
    status: true,
    telegram_id: '@khaled_ib',
    job_title: 'مصمم UI/UX',
    weekly_hours: 14,
    teams: [1, 2],
  },
  {
    id: 9,
    name: 'ليلى محمود',
    email: 'layla@ghras.com',
    role: 'volunteer',
    status: true,
    telegram_id: '@layla_m',
    job_title: 'كاتبة إبداعية',
    weekly_hours: 10,
    teams: [5],
  },
  {
    id: 10,
    name: 'حسن علي',
    email: 'hassan@ghras.com',
    role: 'supervisor',
    status: true,
    telegram_id: '@hassan_ali',
    job_title: 'مدير محتوى',
    weekly_hours: 18,
    teams: [2, 5],
  },
  {
    id: 11,
    name: 'زينب أحمد',
    email: 'zainab@ghras.com',
    role: 'volunteer',
    status: true,
    telegram_id: '@zainab_a',
    job_title: 'مصورة فوتوغرافية',
    weekly_hours: 8,
    teams: [1, 2],
  },
  {
    id: 12,
    name: 'طارق السيد',
    email: 'tarek@ghras.com',
    role: 'volunteer',
    status: true,
    telegram_id: '@tarek_s',
    job_title: 'مطور تطبيقات',
    weekly_hours: 16,
    teams: [3],
  },
  {
    id: 13,
    name: 'هدى محمد',
    email: 'huda@ghras.com',
    role: 'volunteer',
    status: true,
    telegram_id: '@huda_m',
    job_title: 'مديرة تلجرام',
    weekly_hours: 12,
    teams: [4],
  },
  {
    id: 14,
    name: 'إبراهيم خليل',
    email: 'ibrahim@ghras.com',
    role: 'volunteer',
    status: false,
    telegram_id: '@ibrahim_k',
    job_title: 'محلل بيانات',
    weekly_hours: 0,
    teams: [3],
  },
  {
    id: 15,
    name: 'ريم عبدالرحمن',
    email: 'reem@ghras.com',
    role: 'volunteer',
    status: true,
    telegram_id: '@reem_ar',
    job_title: 'مسوقة رقمية',
    weekly_hours: 10,
    teams: [2],
  },
];

// Mock Data - Tasks
let MOCK_TASKS: Task[] = [
  {
    id: 1,
    title: 'تصميم بوستر رمضان',
    description: 'تصميم بوستر إعلاني لشهر رمضان المبارك',
    status: 'new',
    priority: 'urgent',
    due_date: '2025-12-01',
    team_id: 1,
    assignee_id: 2,
    created_by: 1,
    work_hours: 0,
  },
  {
    id: 2,
    title: 'كتابة مقال عن الصبر',
    description: 'مقال شامل عن فضائل الصبر مع الأدلة الشرعية',
    status: 'in_progress',
    priority: 'normal',
    due_date: '2025-11-28',
    team_id: 5,
    assignee_id: 3,
    created_by: 1,
    started_at: '2025-11-20T10:00:00Z',
    work_hours: 5.5,
  },
  {
    id: 3,
    title: 'نشر منشور يومي',
    description: 'نشر محتوى تحفيزي على صفحات التواصل',
    status: 'done',
    priority: 'normal',
    due_date: '2025-11-22',
    team_id: 2,
    assignee_id: 4,
    created_by: 1,
    started_at: '2025-11-21T09:00:00Z',
    completed_at: '2025-11-22T15:30:00Z',
    work_hours: 2,
  },
  {
    id: 4,
    title: 'إصلاح خطأ في الموقع',
    description: 'معالجة مشكلة عرض القائمة على الجوال',
    status: 'issue',
    priority: 'very_urgent',
    due_date: '2025-11-24',
    team_id: 3,
    assignee_id: 6,
    created_by: 1,
    started_at: '2025-11-23T11:00:00Z',
    work_hours: 3,
  },
  {
    id: 5,
    title: 'إدارة مجموعة الأسئلة',
    description: 'الرد على أسئلة الأعضاء في المجموعة',
    status: 'scheduled',
    priority: 'medium',
    due_date: '2025-11-30',
    team_id: 4,
    assignee_id: 5,
    created_by: 1,
    work_hours: 0,
  },
  {
    id: 6,
    title: 'توثيق واجهات API',
    description: 'كتابة وثائق تفصيلية لجميع واجهات API',
    status: 'docs',
    priority: 'normal',
    due_date: '2025-12-05',
    team_id: 3,
    assignee_id: 6,
    created_by: 1,
    work_hours: 8,
  },
  {
    id: 7,
    title: 'تصميم شعار جديد',
    description: 'تصميم شعار جديد للأكاديمية',
    status: 'new',
    priority: 'medium',
    due_date: '2025-12-10',
    team_id: 1,
    assignee_id: null,
    created_by: 1,
    work_hours: 0,
  },
  {
    id: 8,
    title: 'مراجعة المحتوى الأسبوعي',
    description: 'مراجعة وتدقيق المقالات المكتوبة هذا الأسبوع',
    status: 'in_progress',
    priority: 'urgent',
    due_date: '2025-11-26',
    team_id: 5,
    assignee_id: 3,
    created_by: 1,
    started_at: '2025-11-23T14:00:00Z',
    work_hours: 2.5,
  },
  {
    id: 9,
    title: 'تطوير صفحة هبوط جديدة',
    description: 'تصميم وتطوير صفحة هبوط للدورة الجديدة',
    status: 'scheduled',
    priority: 'urgent',
    due_date: '2025-12-08',
    team_id: 3,
    assignee_id: 12,
    created_by: 1,
    work_hours: 0,
  },
  {
    id: 10,
    title: 'إنشاء فيديو ترويجي',
    description: 'فيديو قصير للترويج للبرنامج على السوشيال ميديا',
    status: 'new',
    priority: 'medium',
    due_date: '2025-12-15',
    team_id: 1,
    assignee_id: 8,
    created_by: 1,
    work_hours: 0,
  },
  {
    id: 11,
    title: 'كتابة سلسلة مقالات',
    description: 'سلسلة من 5 مقالات عن التطوير الذاتي',
    status: 'in_progress',
    priority: 'normal',
    due_date: '2025-12-20',
    team_id: 5,
    assignee_id: 9,
    created_by: 1,
    started_at: '2025-11-22T08:00:00Z',
    work_hours: 12,
  },
  {
    id: 12,
    title: 'حملة إعلانية على فيسبوك',
    description: 'تخطيط وتنفيذ حملة إعلانية على فيسبوك',
    status: 'scheduled',
    priority: 'very_urgent',
    due_date: '2025-11-29',
    team_id: 2,
    assignee_id: 15,
    created_by: 1,
    work_hours: 0,
  },
  {
    id: 13,
    title: 'إدارة المجموعة اليومية',
    description: 'الرد على الأسئلة وإدارة النقاشات في المجموعة',
    status: 'in_progress',
    priority: 'normal',
    due_date: '2025-11-25',
    team_id: 4,
    assignee_id: 13,
    created_by: 1,
    started_at: '2025-11-23T09:00:00Z',
    work_hours: 4,
  },
  {
    id: 14,
    title: 'تصوير محتوى المنتجات',
    description: 'جلسة تصوير احترافية للمنتجات الجديدة',
    status: 'done',
    priority: 'medium',
    due_date: '2025-11-20',
    team_id: 1,
    assignee_id: 11,
    created_by: 1,
    started_at: '2025-11-18T10:00:00Z',
    completed_at: '2025-11-20T16:00:00Z',
    work_hours: 6,
  },
  {
    id: 15,
    title: 'تحديث قاعدة البيانات',
    description: 'تحسين أداء الاستعلامات وإضافة فهارس جديدة',
    status: 'docs',
    priority: 'normal',
    due_date: '2025-12-03',
    team_id: 3,
    assignee_id: 6,
    created_by: 1,
    work_hours: 10,
  },
  {
    id: 16,
    title: 'تصميم هوية بصرية',
    description: 'تصميم هوية بصرية كاملة للمشروع الجديد',
    status: 'new',
    priority: 'urgent',
    due_date: '2025-12-12',
    team_id: 1,
    assignee_id: null,
    created_by: 1,
    work_hours: 0,
  },
  {
    id: 17,
    title: 'إعداد تقرير شهري',
    description: 'تقرير تفصيلي عن إنجازات الشهر الماضي',
    status: 'scheduled',
    priority: 'normal',
    due_date: '2025-11-30',
    team_id: 5,
    assignee_id: 3,
    created_by: 1,
    work_hours: 0,
  },
  {
    id: 18,
    title: 'اختبار التطبيق الجديد',
    description: 'اختبار شامل لجميع ميزات التطبيق',
    status: 'issue',
    priority: 'very_urgent',
    due_date: '2025-11-27',
    team_id: 3,
    assignee_id: 12,
    created_by: 1,
    started_at: '2025-11-23T13:00:00Z',
    work_hours: 5,
  },
];

let nextTaskId = 19;
let nextUserId = 16;

// Simulate API delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// API Functions - Teams
export const fetchTeams = async (): Promise<Team[]> => {
  await delay();
  return MOCK_TEAMS.map(team => TeamSchema.parse(team));
};

// API Functions - Users
export const fetchUsers = async (): Promise<User[]> => {
  await delay();
  return MOCK_USERS.map(user => UserSchema.parse(user));
};

export const createUser = async (input: Omit<CreateUserInput, 'password_confirmation'>): Promise<User> => {
  await delay();
  const newUser: User = {
    id: nextUserId++,
    name: input.name,
    email: input.email,
    role: input.role,
    status: input.status ?? true,
    telegram_id: input.telegram_id || null,
    job_title: input.job_title || null,
    weekly_hours: input.weekly_hours || null,
    teams: input.teams || [],
  };
  const parsed = UserSchema.parse(newUser);
  MOCK_USERS.push(parsed);
  return parsed;
};

export const updateUser = async (id: number, input: Partial<User>): Promise<User> => {
  await delay();
  const index = MOCK_USERS.findIndex(u => u.id === id);
  if (index === -1) throw new Error('المستخدم غير موجود');
  
  MOCK_USERS[index] = { ...MOCK_USERS[index], ...input };
  return UserSchema.parse(MOCK_USERS[index]);
};

export const deleteUser = async (id: number): Promise<void> => {
  await delay();
  const index = MOCK_USERS.findIndex(u => u.id === id);
  if (index === -1) throw new Error('المستخدم غير موجود');
  MOCK_USERS.splice(index, 1);
};

// API Functions - Tasks
export const fetchTasks = async (teamId?: number): Promise<Task[]> => {
  await delay();
  let tasks = MOCK_TASKS;
  if (teamId) {
    tasks = tasks.filter(task => task.team_id === teamId);
  }
  return tasks.map(task => TaskSchema.parse(task));
};

export const createTask = async (input: CreateTaskInput & { created_by: number }): Promise<Task> => {
  await delay();
  const newTask: Task = {
    id: nextTaskId++,
    title: input.title,
    description: input.description || null,
    status: 'new',
    priority: input.priority || 'normal',
    due_date: input.due_date || null,
    team_id: input.team_id,
    assignee_id: input.assignee_id || null,
    created_by: input.created_by,
    started_at: null,
    completed_at: null,
    work_hours: input.work_hours || 0,
  };
  const parsed = TaskSchema.parse(newTask);
  MOCK_TASKS.push(parsed);
  return parsed;
};

export const updateTask = async (id: number, input: UpdateTaskInput): Promise<Task> => {
  await delay();
  const index = MOCK_TASKS.findIndex(t => t.id === id);
  if (index === -1) throw new Error('المهمة غير موجودة');
  
  const oldTask = MOCK_TASKS[index];
  const updatedTask = { ...oldTask, ...input };
  
  // Auto-set timestamps based on status changes
  if (input.status && input.status !== oldTask.status) {
    if (input.status === 'in_progress' && !updatedTask.started_at) {
      updatedTask.started_at = new Date().toISOString();
    }
    if (input.status === 'done' && !updatedTask.completed_at) {
      updatedTask.completed_at = new Date().toISOString();
    }
  }
  
  MOCK_TASKS[index] = updatedTask;
  return TaskSchema.parse(updatedTask);
};

export const deleteTask = async (id: number): Promise<void> => {
  await delay();
  const index = MOCK_TASKS.findIndex(t => t.id === id);
  if (index === -1) throw new Error('المهمة غير موجودة');
  MOCK_TASKS.splice(index, 1);
};

// API Functions - Statistics
export const fetchStats = async (): Promise<Stats> => {
  await delay();
  
  // Calculate tasks distribution
  const tasks_distribution: Record<string, number> = {
    new: 0,
    scheduled: 0,
    in_progress: 0,
    issue: 0,
    done: 0,
    docs: 0,
  };
  
  MOCK_TASKS.forEach(task => {
    tasks_distribution[task.status]++;
  });
  
  // Calculate team performance
  const team_performance = MOCK_TEAMS.map(team => {
    const teamTasks = MOCK_TASKS.filter(t => t.team_id === team.id);
    const completed = teamTasks.filter(t => t.status === 'done').length;
    return {
      team: team.name,
      team_id: team.id,
      completed,
      total: teamTasks.length,
    };
  });
  
  // Calculate member performance
  const memberStats = new Map<number, { completed: number; hours: number }>();
  
  MOCK_TASKS.forEach(task => {
    if (task.assignee_id) {
      const current = memberStats.get(task.assignee_id) || { completed: 0, hours: 0 };
      if (task.status === 'done') {
        current.completed++;
      }
      current.hours += task.work_hours || 0;
      memberStats.set(task.assignee_id, current);
    }
  });
  
  const member_performance = Array.from(memberStats.entries())
    .map(([userId, stats]) => {
      const user = MOCK_USERS.find(u => u.id === userId);
      return {
        user_id: userId,
        name: user?.name || 'غير معروف',
        completed_tasks: stats.completed,
        total_hours: stats.hours,
      };
    })
    .sort((a, b) => b.completed_tasks - a.completed_tasks);
  
  return StatsSchema.parse({
    tasks_distribution,
    team_performance,
    member_performance,
  });
};
