# Ghras Task Manager

<div align="center">

[![Version](https://img.shields.io/badge/Version-1.0.0-green)](https://github.com/your-repo/ghras-admin)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

**Advanced Task Management System for Volunteer Teams at Ghras Al-Ilm Academy**

[Quick Start](#-quick-start) • [Features](#-key-features) • [Documentation](#-documentation) • [Support](#-support)

</div>

---

## 📖 Overview

**Ghras Task Manager** is a professional SaaS platform built with modern technologies to manage volunteer team tasks at Ghras Al-Ilm Academy. The system provides an interactive Kanban board, comprehensive user management, and advanced analytics - all in Arabic with first-class RTL support.

### 🎯 Why This System?

Replaces manual processes (such as Google Sheets and WhatsApp groups) with a centralized system that provides:
- ✅ Accurate tracking of tasks and accomplishments
- ✅ Fair distribution of work among teams
- ✅ Real-time reports and analytics
- ✅ Complete transparency in performance
- ✅ Visual achievements to motivate volunteers

---

## ✨ Key Features

### 🎯 Kanban Task System
```
New → Scheduled → In Progress → Issue → Completed → Documentation
```
- **Drag & Drop** with full RTL support
- **Automatic logging** of start and completion dates
- **Interactive cards** with priorities and deadlines
- **Real-time updates** with Optimistic UI

### 👥 User Management
- Interactive table with search and filtering
- Add and edit users
- Multiple roles (Admin, Supervisor, Volunteer)
- Team assignment and volunteer hours tracking

### 📊 Analytics Dashboard
- Pie and bar charts
- Volunteer ranking by achievement
- Quick summaries of key metrics
- Export-ready reports

### 🎨 Superior User Experience
- **Dark/Light mode** automatic switching
- **Responsive design** (Mobile-First)
- **Full RTL** in every detail
- **Instant notifications** for every action
- **Smooth animations**

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm

### Installation

```powershell
# 1. Clone the project
git clone https://github.com/your-repo/ghras-admin.git
cd ghras-admin

# 2. Install packages
pnpm install

# 3. Setup environment
Copy-Item .env.example .env

# 4. Run the application
pnpm run dev
```

The application will run on **http://localhost:3000** 🎉

### Additional Commands

```powershell
pnpm run build      # Build production version
pnpm run preview    # Preview production build
pnpm run test       # Run tests
pnpm run lint       # Code quality check
```

📘 **For more details**: Read the [Quick Start Guide](./docs/SETUP.md)

---

## 🛠️ Technology Stack

<div align="center">

| Category | Technology | Version |
|----------|------------|---------|
| **Frontend** | React + TypeScript | 18.2 / 5.3 |
| **Build Tool** | Vite | 5.0 |
| **Styling** | Tailwind CSS | 3.4 |
| **State** | TanStack Query | 5.0 |
| **Routing** | React Router | 6.21 |
| **DnD** | @hello-pangea/dnd | 16.5 |
| **Charts** | Recharts | 2.10 |
| **Validation** | Zod | 3.22 |
| **Notifications** | React Hot Toast | 2.4 |
| **Testing** | Vitest + Testing Library | Latest |

</div>

---

## 📁 Project Structure

```
ghras-admin/
├── 📄 index.html              # RTL entry point
├── 📦 package.json            # Dependencies
├── ⚙️  vite.config.ts         # Vite configuration
├── 🎨 tailwind.config.js     # Design system
├── 📝 tsconfig.json          # TypeScript strict mode
├── 📚 src/
│   ├── 🚀 main.tsx           # Entry point + React Query
│   ├── 🎨 index.css          # Complete design system
│   ├── 📋 types.ts           # Zod Schemas + Types
│   │
│   ├── 📡 api/
│   │   └── mockApi.ts        # Mock API (ready for replacement)
│   │
│   ├── 🎣 hooks/
│   │   ├── useRole.ts        # Role management
│   │   └── useDarkMode.ts    # Dark mode
│   │
│   ├── 🧩 components/
│   │   ├── ErrorBoundary.tsx # Error handling
│   │   ├── ToastProvider.tsx # Notifications
│   │   ├── Modal.tsx         # Modal dialogs
│   │   ├── LoadingSpinner.tsx
│   │   └── EmptyState.tsx
│   │
│   ├── 🏗️  layouts/
│   │   └── AppLayout.tsx     # Main layout
│   │
│   └── 📄 pages/
│       ├── Home.tsx           # Role selection
│       ├── TeamDashboard.tsx  # Kanban Board
│       ├── UsersManagement.tsx
│       └── Statistics.tsx
│
├── 📖 README.md              # This file
├── 📘 docs/SETUP.md          # Setup guide
└── 📊 docs/PROJECT_SUMMARY.md # Comprehensive summary
```

---

## 🎯 Usage Guide

### 1️⃣ Select Your Role
- **Admin** → Full permissions
- **Supervisor** → Task and user management
- **Volunteer** → Personal task management

### 2️⃣ Task Management (Kanban)
- Select your team from the sidebar
- Drag tasks between columns
- Click ➕ to add a task (Admin/Supervisor)
- Click ✏️ to edit or 🗑️ to delete

### 3️⃣ User Management (Admin/Supervisor)
- Use search to find users
- Add new accounts with specific roles
- Enable or disable accounts with one click

### 4️⃣ View Analytics
- Task distribution by status
- Team and volunteer performance
- Key metrics summaries

---

## 🎨 Design System

### Colors
- **Primary**: `#059669` (Emerald green)
- **Background**: `#f8fafc` / `#1e293b` (Light/Dark)
- **Task States**: 6 distinct colors
- **Priorities**: 4 color-coded levels

### Typography
- **Cairo** - Professional Arabic font from Google Fonts
- Scales from xs to 6xl

### Components
- Buttons (btn, btn-primary, btn-secondary, btn-danger)
- Cards (card, card-hover)
- Badges (badge with state variants)
- RTL-formatted tables
- Modal dialogs (Modal with Portal)

📘 **For full details**: Read the [Project Summary](./docs/PROJECT_SUMMARY.md)

---

## 🔐 Permission System (RBAC)

### Admin
✅ All permissions  
✅ User management  
✅ Task management  
✅ View analytics  
✅ All teams

### Supervisor
✅ User management  
✅ Task management  
✅ View analytics  
✅ All teams

### Volunteer
✅ View team tasks  
✅ Move tasks  
✅ Log work hours  
❌ Cannot create/delete tasks  
❌ No management access

---

## 📱 Responsive Design

| Device | Size | Features |
|--------|------|----------|
| 📱 **Mobile** | < 768px | Dropdown menu, vertical columns |
| 📲 **Tablet** | 768-1024px | Fixed sidebar, medium grid |
| 💻 **Desktop** | > 1024px | Full layout, 6 columns |

---

## 🔄 Backend Integration

The application is ready for integration with a Laravel backend:

### Integration Steps

1. **Update environment variables**
```bash
# In .env
VITE_API_URL=http://localhost:8000/api
```

2. **Replace Mock API**
```typescript
// Before (Mock)
export const fetchTasks = async () => {
  await delay();
  return MOCK_TASKS;
};

// After (Real API)
export const fetchTasks = async () => {
  const response = await fetch(`${API_URL}/tasks`);
  const data = await response.json();
  return data.map(task => TaskSchema.parse(task));
};
```

3. **Add Authentication**
```typescript
// Add JWT tokens
const token = localStorage.getItem('token');
headers: { 'Authorization': `Bearer ${token}` }
```

### Laravel API Requirements
- Laravel 11+ with Sanctum
- MySQL database
- RESTful API endpoints
- Zod schema validation

📘 **For more details**: See [Project Documentation](./docs/Project%20Documentation.md)

---

## 🧪 Testing

```powershell
# Run all tests
pnpm run test

# With coverage
pnpm run test -- --coverage

# Watch mode
pnpm run test -- --watch
```

### Test Coverage
- ✅ Core React components
- ✅ Custom hooks
- ✅ API functions
- ✅ Zod validation
- ⏳ E2E tests (in development)

---

## 📚 Documentation

- 📄 [README](./README.md) - This file
- 📘 [Quick Start Guide](./docs/SETUP.md)
- 📊 [Project Summary](./docs/PROJECT_SUMMARY.md)
- 📖 [Full Project Documentation](./docs/Project%20Documentation.md)

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. **Fork** the project
2. Create a **branch** for your feature
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a **Pull Request**

### Contribution Guidelines
- ✅ Strict TypeScript code
- ✅ Tests for every new feature
- ✅ Arabic documentation
- ✅ RTL everywhere
- ✅ Follow existing code style

---

## 📄 License

This project is developed for **Ghras Al-Ilm Academy**.  
All rights reserved © 2025

---

## 🙏 Acknowledgments

- **Ghras Al-Ilm Academy Team** - Vision and guidance
- **React Team** - Amazing framework
- **Tailwind Labs** - Outstanding design system
- **TanStack** - Powerful state management tools
- **Open Source Community** - All libraries used

---

## 💬 Support

### For assistance:
1. 📖 Read the [Quick Start Guide](./docs/SETUP.md)
2. 📊 Review the [Project Summary](./docs/PROJECT_SUMMARY.md)
3. 🐛 Open an [Issue on GitHub](https://github.com/your-repo/issues)
4. 💬 Contact via Telegram: `@ghras_support`

### Quick Links
- 🌐 [Official Website](https://ghras.com)
- 📧 [Email](mailto:support@ghras.com)
- 📱 [Telegram Channel](https://t.me/ghras_academy)

---

<div align="center">

**Made with ❤️ for Ghras Al-Ilm Academy**

**Version**: 1.0.0 | **Last Updated**: November 2025

[⬆ Back to Top](#ghras-task-manager)

</div>