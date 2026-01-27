import {
  Team,
  User,
  Task,
  Project,
  TaskLink,
  Stats,
  CreateTaskInput,
  UpdateTaskInput,
  CreateUserInput,
  TeamSchema,
  UserSchema,
  TaskSchema,
  StatsSchema,
} from '../types';

// Mock Data - Projects (exported for projectApi.ts)
export let MOCK_PROJECTS: Project[] = [
  {
    id: 1,
    name: 'موقع الأكاديمية الرسمي',
    description: 'بناء وتطوير الموقع الرسمي للأكاديمية',
    active: true,
    created_by: 1,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'دورة التسويق الرقمي',
    description: 'إنتاج محتوى وتطوير منصة الدورة',
    active: true,
    created_by: 1,
    created_at: '2025-02-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'تطبيق إدارة المشاريع',
    description: 'تطوير تطبيق ويب لإدارة مشاريع الأكاديمية',
    active: true,
    created_by: 1,
    created_at: '2025-03-01T00:00:00Z',
  },
  {
    id: 4,
    name: 'حملة توعية الخصوصية',
    description: 'إعداد محتوى توعوي حول الخصوصية الرقمية',
    active: true,
    created_by: 1,
    created_at: '2025-04-01T00:00:00Z',
  },
];

// Mock Data - Task Links (exported for projectApi.ts)
export let MOCK_TASK_LINKS: TaskLink[] = [
  { id: 1, source_task_id: 1, linked_task_id: 7, created_at: '2025-11-20T00:00:00Z' },
  { id: 2, source_task_id: 2, linked_task_id: 8, created_at: '2025-11-21T00:00:00Z' },
];

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
    job_field: 'تطوير ويب',
    experience_years: 8,
    age: 28,
    country: 'مصر',
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
    job_field: 'تصميم جرافيك',
    experience_years: 6,
    age: 26,
    country: 'السعودية',
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
    job_field: 'كتابة محتوى',
    experience_years: 3,
    age: 24,
    country: 'الإمارات',
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
    job_field: 'تسويق إلكتروني',
    experience_years: 4,
    age: 25,
    country: 'مصر',
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
    job_field: 'إدارة مجتمع',
    experience_years: 2,
    age: 23,
    country: 'الكويت',
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
    job_field: 'البرمجة',
    experience_years: 7,
    age: 29,
    country: 'مصر',
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
    job_field: 'تحرير فيديو',
    experience_years: 5,
    age: 27,
    country: 'الأردن',
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
    job_field: 'تصميم UI/UX',
    experience_years: 5,
    age: 26,
    country: 'مصر',
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
    job_field: 'الكتابة الإبداعية',
    experience_years: 4,
    age: 25,
    country: 'السعودية',
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
    job_field: 'إدارة محتوى',
    experience_years: 6,
    age: 28,
    country: 'مصر',
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
    job_field: 'التصوير الفوتوغرافي',
    experience_years: 3,
    age: 24,
    country: 'الإمارات',
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
    job_field: 'تطوير تطبيقات',
    experience_years: 5,
    age: 27,
    country: 'مصر',
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
    job_field: 'إدارة تلجرام',
    experience_years: 3,
    age: 24,
    country: 'السعودية',
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
    job_field: 'تحليل البيانات',
    experience_years: 4,
    age: 26,
    country: 'مصر',
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
    job_field: 'التسويق الرقمي',
    experience_years: 3,
    age: 25,
    country: 'الكويت',
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
    project_id: 2,
    team_id: 1,
    assignee_ids: [2],
    created_by: 1,
    created_at: '2025-11-15T00:00:00Z',
    started_at: null,
    completed_at: null,
    work_hours: 0,
  },
  {
    id: 2,
    title: 'كتابة مقال عن الصبر',
    description: 'مقال شامل عن فضائل الصبر مع الأدلة الشرعية',
    status: 'in_progress',
    priority: 'normal',
    due_date: '2025-11-28',
    project_id: 4,
    team_id: 5,
    assignee_ids: [3],
    created_by: 1,
    created_at: '2025-11-18T00:00:00Z',
    started_at: '2025-11-20T10:00:00Z',
    completed_at: null,
    work_hours: 5.5,
  },
  {
    id: 3,
    title: 'نشر منشور يومي',
    description: 'نشر محتوى تحفيزي على صفحات التواصل',
    status: 'done',
    priority: 'normal',
    due_date: '2025-11-22',
    project_id: 2,
    team_id: 2,
    assignee_ids: [4],
    created_by: 1,
    created_at: '2025-11-19T00:00:00Z',
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
    project_id: 1,
    team_id: 3,
    assignee_ids: [6],
    created_by: 1,
    created_at: '2025-11-22T00:00:00Z',
    started_at: '2025-11-23T11:00:00Z',
    completed_at: null,
    work_hours: 3,
  },
  {
    id: 5,
    title: 'إدارة مجموعة الأسئلة',
    description: 'الرد على أسئلة الأعضاء في المجموعة',
    status: 'scheduled',
    priority: 'medium',
    due_date: '2025-11-30',
    project_id: 4,
    team_id: 4,
    assignee_ids: [5],
    created_by: 1,
    created_at: '2025-11-20T00:00:00Z',
    started_at: null,
    completed_at: null,
    work_hours: 0,
  },
  {
    id: 6,
    title: 'توثيق واجهات API',
    description: 'كتابة وثائق تفصيلية لجميع واجهات API',
    status: 'docs',
    priority: 'normal',
    due_date: '2025-12-05',
    project_id: 3,
    team_id: 3,
    assignee_ids: [6],
    created_by: 1,
    created_at: '2025-11-10T00:00:00Z',
    started_at: null,
    completed_at: null,
    work_hours: 8,
  },
  {
    id: 7,
    title: 'تصميم شعار جديد',
    description: 'تصميم شعار جديد للأكاديمية',
    status: 'new',
    priority: 'medium',
    due_date: '2025-12-10',
    project_id: 1,
    team_id: 1,
    assignee_ids: [],
    created_by: 1,
    created_at: '2025-11-25T00:00:00Z',
    started_at: null,
    completed_at: null,
    work_hours: 0,
  },
  {
    id: 8,
    title: 'مراجعة المحتوى الأسبوعي',
    description: 'مراجعة وتدقيق المقالات المكتوبة هذا الأسبوع',
    status: 'in_progress',
    priority: 'urgent',
    due_date: '2025-11-26',
    project_id: 4,
    team_id: 5,
    assignee_ids: [3],
    created_by: 1,
    created_at: '2025-11-21T00:00:00Z',
    started_at: '2025-11-23T14:00:00Z',
    completed_at: null,
    work_hours: 2.5,
  },
  {
    id: 9,
    title: 'تطوير صفحة هبوط جديدة',
    description: 'تصميم وتطوير صفحة هبوط للدورة الجديدة',
    status: 'scheduled',
    priority: 'urgent',
    due_date: '2025-12-08',
    project_id: 2,
    team_id: 3,
    assignee_ids: [12],
    created_by: 1,
    created_at: '2025-11-24T00:00:00Z',
    started_at: null,
    completed_at: null,
    work_hours: 0,
  },
  {
    id: 10,
    title: 'إنشاء فيديو ترويجي',
    description: 'فيديو قصير للترويج للبرنامج على السوشيال ميديا',
    status: 'new',
    priority: 'medium',
    due_date: '2025-12-15',
    project_id: 2,
    team_id: 1,
    assignee_ids: [8],
    created_by: 1,
    created_at: '2025-11-26T00:00:00Z',
    started_at: null,
    completed_at: null,
    work_hours: 0,
  },
  {
    id: 11,
    title: 'كتابة سلسلة مقالات',
    description: 'سلسلة من 5 مقالات عن التطوير الذاتي',
    status: 'in_progress',
    priority: 'normal',
    due_date: '2025-12-20',
    project_id: 4,
    team_id: 5,
    assignee_ids: [9],
    created_by: 1,
    created_at: '2025-11-18T00:00:00Z',
    started_at: '2025-11-22T08:00:00Z',
    completed_at: null,
    work_hours: 12,
  },
  {
    id: 12,
    title: 'حملة إعلانية على فيسبوك',
    description: 'تخطيط وتنفيذ حملة إعلانية على فيسبوك',
    status: 'scheduled',
    priority: 'very_urgent',
    due_date: '2025-11-29',
    project_id: 2,
    team_id: 2,
    assignee_ids: [15],
    created_by: 1,
    created_at: '2025-11-23T00:00:00Z',
    started_at: null,
    completed_at: null,
    work_hours: 0,
  },
  {
    id: 13,
    title: 'إدارة المجموعة اليومية',
    description: 'الرد على الأسئلة وإدارة النقاشات في المجموعة',
    status: 'in_progress',
    priority: 'normal',
    due_date: '2025-11-25',
    project_id: 4,
    team_id: 4,
    assignee_ids: [13],
    created_by: 1,
    created_at: '2025-11-22T00:00:00Z',
    started_at: '2025-11-23T09:00:00Z',
    completed_at: null,
    work_hours: 4,
  },
  {
    id: 14,
    title: 'تصوير محتوى المنتجات',
    description: 'جلسة تصوير احترافية للمنتجات الجديدة',
    status: 'done',
    priority: 'medium',
    due_date: '2025-11-20',
    project_id: 2,
    team_id: 1,
    assignee_ids: [11],
    created_by: 1,
    created_at: '2025-11-16T00:00:00Z',
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
    project_id: 3,
    team_id: 3,
    assignee_ids: [6],
    created_by: 1,
    created_at: '2025-11-12T00:00:00Z',
    started_at: null,
    completed_at: null,
    work_hours: 10,
  },
  {
    id: 16,
    title: 'تصميم هوية بصرية',
    description: 'تصميم هوية بصرية كاملة للمشروع الجديد',
    status: 'new',
    priority: 'urgent',
    due_date: '2025-12-12',
    project_id: 1,
    team_id: 1,
    assignee_ids: [],
    created_by: 1,
    created_at: '2025-11-27T00:00:00Z',
    started_at: null,
    completed_at: null,
    work_hours: 0,
  },
  {
    id: 17,
    title: 'إعداد تقرير شهري',
    description: 'تقرير تفصيلي عن إنجازات الشهر الماضي',
    status: 'scheduled',
    priority: 'normal',
    due_date: '2025-11-30',
    project_id: 4,
    team_id: 5,
    assignee_ids: [3],
    created_by: 1,
    created_at: '2025-11-25T00:00:00Z',
    started_at: null,
    completed_at: null,
    work_hours: 0,
  },
  {
    id: 18,
    title: 'اختبار التطبيق الجديد',
    description: 'اختبار شامل لجميع ميزات التطبيق',
    status: 'issue',
    priority: 'very_urgent',
    due_date: '2025-11-27',
    project_id: 3,
    team_id: 3,
    assignee_ids: [12],
    created_by: 1,
    created_at: '2025-11-21T00:00:00Z',
    started_at: '2025-11-23T13:00:00Z',
    completed_at: null,
    work_hours: 5,
  },
];

let nextTaskId = 19;
let nextUserId = 16;
let currentUserId = 1; // Simulate logged-in user

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

export const getCurrentUser = async (): Promise<User> => {
  await delay();
  const user = MOCK_USERS.find(u => u.id === currentUserId);
  if (!user) throw new Error('المستخدم غير موجود');
  return UserSchema.parse(user);
};

export const updateCurrentUser = async (input: Partial<User>): Promise<User> => {
  await delay();
  const index = MOCK_USERS.findIndex(u => u.id === currentUserId);
  if (index === -1) throw new Error('المستخدم غير موجود');
  
  MOCK_USERS[index] = { 
    ...MOCK_USERS[index], 
    ...input,
    updated_at: new Date().toISOString()
  };
  return UserSchema.parse(MOCK_USERS[index]);
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
    job_field: input.job_field || null,
    experience_years: input.experience_years || null,
    age: input.age || null,
    country: input.country || null,
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

export const fetchTasksByProject = async (projectId: number): Promise<Task[]> => {
  await delay();
  const tasks = MOCK_TASKS.filter(task => task.project_id === projectId);
  return tasks.map(task => TaskSchema.parse(task));
};

export const createTask = async (input: CreateTaskInput & { created_by: number; status?: string; project_id?: number }): Promise<Task> => {
  await delay();
  const newTask: Task = {
    id: nextTaskId++,
    title: input.title,
    description: input.description || null,
    status: (input.status as any) || 'new',
    priority: input.priority || 'normal',
    due_date: input.due_date || null,
    project_id: input.project_id || null,
    team_id: input.team_id,
    assignee_ids: input.assignee_ids || [],
    created_by: input.created_by,
    created_at: new Date().toISOString(),
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
    task.assignee_ids.forEach(assigneeId => {
      const current = memberStats.get(assigneeId) || { completed: 0, hours: 0 };
      if (task.status === 'done') {
        current.completed++;
      }
      current.hours += task.work_hours || 0;
      memberStats.set(assigneeId, current);
    });
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
