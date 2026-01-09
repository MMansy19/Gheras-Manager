import { supabase } from '../lib/supabase';
import {
    Course,
    CourseSchema,
    Enrollment,
    EnrollmentSchema,
    DailyAttendance,
    DailyAttendanceSchema,
    CreateCourseInput,
    EnrollmentWithAttendance,
} from '../types';

// ==================== COURSE MANAGEMENT ====================

/**
 * Create a new course with automatic end date calculation (start_date + 10 days)
 */
export const createCourse = async (input: CreateCourseInput): Promise<Course> => {
    const startDate = new Date(input.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 9); // 10 days total (day 1 to day 10)

    const { data, error } = await supabase
        .from('courses')
        .insert({
            start_date: input.start_date,
            end_date: endDate.toISOString().split('T')[0],
            active: true,
            created_by: input.created_by,
        })
        .select()
        .single();

    if (error) throw new Error(`فشل إنشاء الدورة: ${error.message}`);
    return CourseSchema.parse(data);
};

/**
 * Get the currently active course
 */
export const getActiveCourse = async (): Promise<Course | null> => {
    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // No active course found
        throw new Error(`فشل جلب الدورة النشطة: ${error.message}`);
    }

    return data ? CourseSchema.parse(data) : null;
};

/**
 * Get all courses (for admin dashboard)
 */
export const getAllCourses = async (): Promise<Course[]> => {
    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(`فشل جلب الدورات: ${error.message}`);
    return data.map((course: any) => CourseSchema.parse(course));
};

/**
 * Deactivate a course
 */
export const deactivateCourse = async (courseId: number): Promise<void> => {
    const { error } = await supabase
        .from('courses')
        .update({ active: false })
        .eq('id', courseId);

    if (error) throw new Error(`فشل إلغاء تفعيل الدورة: ${error.message}`);
};

/**
 * Check if today is Day 1 of the active course
 */
export const isRegistrationDay = async (): Promise<boolean> => {
    const course = await getActiveCourse();
    if (!course) return false;

    const today = new Date().toISOString().split('T')[0];
    return today === course.start_date;
};

/**
 * Get current day number (1-10) for active course
 * Returns null if no active course or outside course period
 */
export const getCurrentDayNumber = async (): Promise<number | null> => {
    const course = await getActiveCourse();
    if (!course) return null;

    const today = new Date();
    const startDate = new Date(course.start_date);
    const endDate = new Date(course.end_date);

    // Reset time to compare dates only
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (today < startDate || today > endDate) return null;

    const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff + 1; // Day 1-10
};

// ==================== ENROLLMENT MANAGEMENT ====================

/**
 * Create enrollment for a new user (called after Supabase Auth signup)
 */
export const createEnrollment = async (
    userId: string,
    courseId: number,
    fullName: string,
    email: string
): Promise<Enrollment> => {
    const { data, error } = await supabase
        .from('enrollments')
        .insert({
            user_id: userId,
            course_id: courseId,
            full_name: fullName,
            email: email,
        })
        .select()
        .single();

    if (error) throw new Error(`فشل إنشاء التسجيل: ${error.message}`);
    return EnrollmentSchema.parse(data);
};

/**
 * Get enrollment by user ID and course ID
 */
export const getEnrollmentByUser = async (
    userId: string,
    courseId: number
): Promise<Enrollment | null> => {
    const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not enrolled
        throw new Error(`فشل جلب التسجيل: ${error.message}`);
    }

    return data ? EnrollmentSchema.parse(data) : null;
};

/**
 * Get all enrollments for a course with attendance details
 */
export const getEnrollmentsWithAttendance = async (
    courseId: number
): Promise<EnrollmentWithAttendance[]> => {
    const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: true });

    if (enrollError) throw new Error(`فشل جلب المسجلين: ${enrollError.message}`);

    // Get attendance for all enrollments
    const enrollmentIds = enrollments.map((e: any) => e.id);
    const { data: attendances, error: attError } = await supabase
        .from('daily_attendances')
        .select('*')
        .in('enrollment_id', enrollmentIds);

    if (attError) throw new Error(`فشل جلب الحضور: ${attError.message}`);

    // Combine data
    return enrollments.map((enrollment: any) => {
        const userAttendances = attendances?.filter((a: any) => a.enrollment_id === enrollment.id) || [];
        const attendanceDays = userAttendances.map((a: any) => a.day_number).sort((a: number, b: number) => a - b);

        return {
            ...EnrollmentSchema.parse(enrollment),
            attendance_days: attendanceDays,
            attendance_count: attendanceDays.length,
            is_complete: attendanceDays.length === 10,
        };
    });
};

// ==================== ATTENDANCE MANAGEMENT ====================

/**
 * Sign attendance for current day
 */
export const signDailyAttendance = async (
    enrollmentId: number,
    dayNumber: number
): Promise<DailyAttendance> => {
    // Check if already signed today
    const { data: existing } = await supabase
        .from('daily_attendances')
        .select('*')
        .eq('enrollment_id', enrollmentId)
        .eq('day_number', dayNumber)
        .single();

    if (existing) {
        return DailyAttendanceSchema.parse(existing);
    }

    const { data, error } = await supabase
        .from('daily_attendances')
        .insert({
            enrollment_id: enrollmentId,
            day_number: dayNumber,
        })
        .select()
        .single();

    if (error) throw new Error(`فشل تسجيل الحضور: ${error.message}`);
    return DailyAttendanceSchema.parse(data);
};

/**
 * Get attendance records for an enrollment
 */
export const getAttendanceByEnrollment = async (
    enrollmentId: number
): Promise<DailyAttendance[]> => {
    const { data, error } = await supabase
        .from('daily_attendances')
        .select('*')
        .eq('enrollment_id', enrollmentId)
        .order('day_number', { ascending: true });

    if (error) throw new Error(`فشل جلب سجل الحضور: ${error.message}`);
    return data.map((att: any) => DailyAttendanceSchema.parse(att));
};

/**
 * Check if user has complete attendance (all 10 days)
 */
export const hasCompleteAttendance = async (enrollmentId: number): Promise<boolean> => {
    const attendances = await getAttendanceByEnrollment(enrollmentId);
    return attendances.length === 10;
};

/**
 * Get course statistics
 */
export const getCourseStats = async (courseId: number) => {
    const enrollments = await getEnrollmentsWithAttendance(courseId);
    const currentDay = await getCurrentDayNumber();

    return {
        totalEnrollments: enrollments.length,
        completedStudents: enrollments.filter(e => e.is_complete).length,
        currentDay: currentDay,
        averageAttendance: enrollments.length > 0
            ? enrollments.reduce((sum, e) => sum + e.attendance_count, 0) / enrollments.length
            : 0,
        dailyStats: Array.from({ length: 10 }, (_, i) => {
            const day = i + 1;
            const count = enrollments.filter(e => e.attendance_days.includes(day)).length;
            return { day, count, percentage: enrollments.length > 0 ? (count / enrollments.length) * 100 : 0 };
        }),
    };
};
