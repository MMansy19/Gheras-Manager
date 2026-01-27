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
  job_title: z.string().nullable().optional(),
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
  team_id: z.number(),
  assignee_ids: z.array(z.number()).default([]),
  created_by: z.number(),
  started_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  work_hours: z.number().default(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

// Create Task Input Schema (for forms)
export const CreateTaskSchema = TaskSchema.pick({
  title: true,
  description: true,
  priority: true,
  due_date: true,
  team_id: true,
  assignee_ids: true,
  work_hours: true,
}).partial({ description: true, due_date: true, assignee_ids: true, work_hours: true });

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
  telegram_id: z.string().optional(),
  job_title: z.string().optional(),
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
    bgClass: 'bg-rose-600',
    textClass: 'text-white'
  },
  urgent: {
    label: 'عاجلة',
    color: '#f59e0b', // amber-500
    bgClass: 'bg-amber-500',
    textClass: 'text-white'
  },
  medium: {
    label: 'متوسطة',
    color: '#a855f7', // purple-500
    bgClass: 'bg-purple-500',
    textClass: 'text-white'
  },
  normal: {
    label: 'عادية',
    color: '#22c55e', // green-500
    bgClass: 'bg-green-500',
    textClass: 'text-white'
  },
};

// Priority labels in Arabic (backward compatibility)
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  very_urgent: PRIORITY_CONFIG.very_urgent.label,
  urgent: PRIORITY_CONFIG.urgent.label,
  medium: PRIORITY_CONFIG.medium.label,
  normal: PRIORITY_CONFIG.normal.label,
};

// Role labels in Arabic
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'مدير',
  supervisor: 'مسؤول',
  volunteer: 'عضو',
};

// Status colors mapping
export const STATUS_COLORS: Record<TaskStatus, string> = {
  new: 'bg-blue-500',
  scheduled: 'bg-purple-500',
  in_progress: 'bg-amber-500',
  issue: 'bg-rose-600',
  done: 'bg-green-600',
  docs: 'bg-gray-500',
};

// Priority colors mapping (backward compatibility)
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  very_urgent: PRIORITY_CONFIG.very_urgent.bgClass,
  urgent: PRIORITY_CONFIG.urgent.bgClass,
  medium: PRIORITY_CONFIG.medium.bgClass,
  normal: PRIORITY_CONFIG.normal.bgClass,
};
