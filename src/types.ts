import { z } from 'zod';

// User Role Enum
export const UserRoleSchema = z.enum(['admin', 'supervisor', 'volunteer']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// User Schema
export const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  role: UserRoleSchema,
  status: z.boolean().default(true),
  telegram_id: z.string().nullable().optional(),
  job_field: z.string().nullable().optional(),
  experience_years: z.number().nullable().optional(),
  age: z.number().nullable().optional(),
  country: z.string().nullable().optional(),
  weekly_hours: z.number().nullable().optional(),
  teams: z.array(z.number()).default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Team Schema
export const TeamSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  members_count: z.number().default(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Team = z.infer<typeof TeamSchema>;

// Project Schema
export const ProjectSchema = z.object({
  id: z.number(),
  name: z.string().min(3, 'اسم المشروع يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().nullable().optional(),
  active: z.boolean().default(true),
  created_by: z.number(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

// Create Project Input Schema
export const CreateProjectSchema = ProjectSchema.pick({
  name: true,
  description: true,
}).partial({ description: true });

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

// Update Project Schema
export const UpdateProjectSchema = ProjectSchema.partial();
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

// Task Status Enum
export const TaskStatusSchema = z.enum([
  'new',
  'scheduled',
  'in_progress',
  'issue',
  'done',
  'docs'
]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

// Task Priority Enum
export const TaskPrioritySchema = z.enum([
  'very_urgent',
  'urgent',
  'medium',
  'normal'
]);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

// Task Schema
export const TaskSchema = z.object({
  id: z.number(),
  title: z.string().min(3, 'عنوان المهمة يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().nullable().optional(),
  status: TaskStatusSchema.default('new'),
  priority: TaskPrioritySchema.default('normal'),
  due_date: z.string().nullable().optional(),
  project_id: z.number().nullable().optional(),
  team_id: z.number().nullable().optional(),
  assignee_id: z.number().nullable().optional(),
  created_by: z.number(),
  started_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  work_hours: z.number().default(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

// Task Link Schema
export const TaskLinkSchema = z.object({
  id: z.number(),
  source_task_id: z.number(),
  linked_task_id: z.number(),
  created_at: z.string().optional(),
});

export type TaskLink = z.infer<typeof TaskLinkSchema>;

// Create Task Input Schema (for forms)
export const CreateTaskSchema = TaskSchema.pick({
  title: true,
  description: true,
  priority: true,
  due_date: true,
  project_id: true,
  team_id: true,
  assignee_id: true,
  work_hours: true,
}).partial({ description: true, due_date: true, assignee_id: true, work_hours: true, project_id: true, team_id: true });

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

// Update Task Schema
export const UpdateTaskSchema = TaskSchema.partial();
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

// Create User Input Schema
export const CreateUserSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  password_confirmation: z.string(),
  role: UserRoleSchema,
  status: z.boolean().default(true),
  age: z.number().nullable().optional(),
  country: z.string().nullable().optional(),
  telegram_id: z.string().optional(),
  job_field: z.string().optional(),
  experience_years: z.number().optional(),
  weekly_hours: z.number().optional(),
  teams: z.array(z.number()).default([]),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['password_confirmation'],
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Stats Schemas
export const TasksDistributionSchema = z.record(z.string(), z.number());
export type TasksDistribution = z.infer<typeof TasksDistributionSchema>;

export const TeamPerformanceSchema = z.object({
  team: z.string(),
  team_id: z.number(),
  completed: z.number(),
  total: z.number(),
});
export type TeamPerformance = z.infer<typeof TeamPerformanceSchema>;

export const MemberPerformanceSchema = z.object({
  user_id: z.number(),
  name: z.string(),
  completed_tasks: z.number(),
  total_hours: z.number(),
});
export type MemberPerformance = z.infer<typeof MemberPerformanceSchema>;

export const StatsSchema = z.object({
  tasks_distribution: TasksDistributionSchema,
  team_performance: z.array(TeamPerformanceSchema),
  member_performance: z.array(MemberPerformanceSchema),
});

export type Stats = z.infer<typeof StatsSchema>;

// Status labels in Arabic
export const STATUS_LABELS: Record<TaskStatus, string> = {
  new: 'جديد',
  scheduled: 'مجدول',
  in_progress: 'قيد التنفيذ',
  issue: 'مشكلة',
  done: 'تم التنفيذ',
  docs: 'وثائق',
};

// Priority configuration with labels and colors
export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgClass: string; textClass: string }> = {
  very_urgent: {
    label: 'عاجلة جدًا',
    color: '#dc2626', // red-600
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-400'
  },
  urgent: {
    label: 'عاجلة',
    color: '#f59e0b', // amber-500
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-700 dark:text-amber-400'
  },
  medium: {
    label: 'متوسطة',
    color: '#a855f7', // purple-500
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-700 dark:text-purple-400'
  },
  normal: {
    label: 'عادية',
    color: '#22c55e', // green-500
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-400'
  },
};

// Priority labels in Arabic (backward compatibility)
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  very_urgent: PRIORITY_CONFIG.very_urgent.label,
  urgent: PRIORITY_CONFIG.urgent.label,
  medium: PRIORITY_CONFIG.medium.label,
  normal: PRIORITY_CONFIG.normal.label,
};

// Work Fields Options in Arabic
export const WORK_FIELDS = [
  'تطوير ويب',
  'تطوير تطبيقات',
  'تصميم جرافيك',
  'تصميم UI/UX',
  'كتابة محتوى',
  'الكتابة الإبداعية',
  'تسويق إلكتروني',
  'التسويق الرقمي',
  'إدارة مجتمع',
  'إدارة محتوى',
  'إدارة تلجرام',
  'البرمجة',
  'تحرير فيديو',
  'التصوير الفوتوغرافي',
  'تحليل البيانات',
  'الأمن السيبراني',
  'إدارة مشاريع',
  'تطوير ألعاب',
  'الذكاء الاصطناعي',
  'علوم البيانات',
  'تصميم الموشن جرافيك',
  'كتابة تقنية',
  'ترجمة',
  'مونتاج صوتي',
  'هندسة الصوت',
] as const;

// Role labels in Arabic
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'مدير',
  supervisor: 'مسؤول',
  volunteer: 'عضو',
};

// Status colors mapping
export const STATUS_COLORS: Record<TaskStatus, string> = {
  new: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
  scheduled: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
  in_progress: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
  issue: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300',
  done: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
  docs: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300',
};

// Priority colors mapping (backward compatibility)
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  very_urgent: PRIORITY_CONFIG.very_urgent.bgClass,
  urgent: PRIORITY_CONFIG.urgent.bgClass,
  medium: PRIORITY_CONFIG.medium.bgClass,
  normal: PRIORITY_CONFIG.normal.bgClass,
};

// ==================== COURSE ENROLLMENT TYPES ====================

// Course Schema
export const CourseSchema = z.object({
  id: z.number(),
  start_date: z.string(),
  end_date: z.string(),
  active: z.boolean().default(true),
  created_at: z.string().optional(),
  created_by: z.number().nullable().optional(),
});

export type Course = z.infer<typeof CourseSchema>;

// Course Enrollment Schema
export const EnrollmentSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  course_id: z.number(),
  full_name: z.string().min(3, 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  created_at: z.string().optional(),
});

export type Enrollment = z.infer<typeof EnrollmentSchema>;

// Daily Attendance Schema
export const DailyAttendanceSchema = z.object({
  id: z.number(),
  enrollment_id: z.number(),
  day_number: z.number().min(1).max(10),
  signed_at: z.string(),
});

export type DailyAttendance = z.infer<typeof DailyAttendanceSchema>;

// Course Registration Input Schema (for new users on Day 1)
export const CourseRegistrationSchema = z.object({
  full_name: z.string().min(3, 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirm_password'],
});

export type CourseRegistrationInput = z.infer<typeof CourseRegistrationSchema>;

// Course Login Input Schema (for Days 2-10)
export const CourseLoginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export type CourseLoginInput = z.infer<typeof CourseLoginSchema>;

// Create Course Input Schema (for admin)
export const CreateCourseSchema = z.object({
  start_date: z.string(),
  created_by: z.number().optional(),
});

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>;

// Enrollment with Attendance Details
export interface EnrollmentWithAttendance extends Enrollment {
  attendance_days: number[];
  attendance_count: number;
  is_complete: boolean;
}

