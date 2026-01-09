import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Course enrollment features will be disabled.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});

// Database types will be generated from Supabase
export type Database = {
    public: {
        Tables: {
            courses: {
                Row: {
                    id: number;
                    title: string;
                    start_date: string;
                    end_date: string;
                    active: boolean;
                    created_at: string;
                    created_by?: number;
                };
                Insert: {
                    title: string;
                    start_date: string;
                    end_date: string;
                    active?: boolean;
                    created_by?: number;
                };
                Update: {
                    title?: string;
                    start_date?: string;
                    end_date?: string;
                    active?: boolean;
                };
            };
            enrollments: {
                Row: {
                    id: number;
                    user_id: string;
                    course_id: number;
                    full_name: string;
                    email: string;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    course_id: number;
                    full_name: string;
                    email: string;
                };
                Update: {
                    full_name?: string;
                };
            };
            daily_attendances: {
                Row: {
                    id: number;
                    enrollment_id: number;
                    day_number: number;
                    signed_at: string;
                };
                Insert: {
                    enrollment_id: number;
                    day_number: number;
                };
                Update: never;
            };
        };
    };
};
