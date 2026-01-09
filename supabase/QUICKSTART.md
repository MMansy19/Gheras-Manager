# 🚀 Quick Start Guide - Course Enrollment System

## Step-by-Step Setup

### Step 1: Install Supabase Package ✅

```bash
pnpm add @supabase/supabase-js
```

### Step 2: Create Supabase Project 🔧

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project to be ready (~2 minutes)
5. Copy your project URL and anon key

### Step 3: Update Environment Variables 📝

Edit `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Set Up Database Tables 🗄️

Go to Supabase SQL Editor and run these scripts:

#### 4.1 Create Courses Table
```sql
CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT
);

CREATE INDEX idx_courses_active ON courses(active) WHERE active = true;
```

#### 4.2 Create Enrollments Table
```sql
CREATE TABLE enrollments (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
```

#### 4.3 Create Daily Attendances Table
```sql
CREATE TABLE daily_attendances (
    id BIGSERIAL PRIMARY KEY,
    enrollment_id BIGINT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 10),
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(enrollment_id, day_number)
);

CREATE INDEX idx_daily_attendances_enrollment ON daily_attendances(enrollment_id);
```

### Step 5: Enable Row Level Security 🔒

Run these for each table:

```sql
-- Courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses"
ON courses FOR SELECT
TO authenticated
USING (true);

-- Enrollments
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollment"
ON enrollments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Daily Attendances
ALTER TABLE daily_attendances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own attendance"
ON daily_attendances FOR SELECT
TO authenticated
USING (
    enrollment_id IN (
        SELECT id FROM enrollments WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can sign their own attendance"
ON daily_attendances FOR INSERT
TO authenticated
WITH CHECK (
    enrollment_id IN (
        SELECT id FROM enrollments WHERE user_id = auth.uid()
    )
);
```

### Step 6: Enable Authentication 🔐

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. (Optional) Configure email templates in Arabic

### Step 7: Build and Test 🧪

```bash
# Build the app
pnpm build

# Or run dev server
pnpm dev
```

### Step 8: Create First Course 📅

1. Go to `/admin/select-role`
2. Login as admin (password from .env: `gheras@3elm`)
3. Navigate to "إدارة الدورات"
4. Click "إنشاء دورة جديدة"
5. Select start date
6. Click "إنشاء الدورة"

### Step 9: Test Student Registration 👥

1. Go to homepage `/`
2. Fill registration form (only works on Day 1)
3. Check Supabase Auth users
4. Verify enrollment in database

### Step 10: Test Daily Login ✅

1. Login with registered email/password
2. Verify attendance is recorded
3. Check attendance grid
4. Repeat for 10 days

---

## Quick Verification Checklist

- [ ] Supabase package installed
- [ ] .env file updated
- [ ] All 3 tables created
- [ ] RLS policies enabled
- [ ] Email auth enabled
- [ ] App builds without errors
- [ ] Admin can create course
- [ ] Students can register (Day 1)
- [ ] Students can login (Days 2-10)
- [ ] Attendance is recorded
- [ ] Certificate generates (after Day 10)

---

## Common Issues & Solutions

### ❌ "Cannot find module '@supabase/supabase-js'"
**Solution:** Run `pnpm add @supabase/supabase-js`

### ❌ "No active course" on homepage
**Solution:** 
1. Check course exists in database
2. Verify `active = true`
3. Check `start_date` and `end_date` include today

### ❌ Registration fails
**Solution:**
1. Verify Email provider is enabled in Supabase Auth
2. Check browser console for errors
3. Ensure enrollments table has correct RLS policies

### ❌ Attendance not recording
**Solution:**
1. Verify user is authenticated
2. Check current date is within course period
3. Ensure enrollment exists for user
4. Verify RLS policies allow insert

### ❌ Certificate won't download
**Solution:**
1. Check student has exactly 10 attendances
2. Verify `jspdf` package is installed
3. Check browser console for errors

---

## Next Steps

✅ **System is ready!** Now you can:

1. **Test the flow:**
   - Create a test course
   - Register test students
   - Sign attendance daily
   - Download certificates

2. **Customize:**
   - Update logo and branding
   - Modify certificate design
   - Add email notifications
   - Customize course duration

3. **Deploy:**
   - Build: `pnpm build`
   - Deploy `dist/` to Netlify
   - Update production env vars
   - Test in production

---

## Support

- 📖 Full docs: `docs/COURSE_SYSTEM_IMPLEMENTATION.md`
- 🗄️ Database setup: `docs/SUPABASE_SETUP.md`
- 🎨 Design system: `docs/DESIGN_SYSTEM.md`

**Ready to go! 🎉**
