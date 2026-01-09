import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastProvider';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import './index.css';

// Lazy load pages for better code splitting
const WelcomePage = lazy(() => import('./pages/WelcomePage').then(module => ({ default: module.WelcomePage })));
const RoleSelection = lazy(() => import('./pages/RoleSelection').then(module => ({ default: module.RoleSelection })));
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const AppLayout = lazy(() => import('./layouts/AppLayout').then(module => ({ default: module.AppLayout })));
const ProjectDashboard = lazy(() => import('./pages/ProjectDashboard').then(module => ({ default: module.ProjectDashboard })));
const UsersManagement = lazy(() => import('./pages/UsersManagement').then(module => ({ default: module.UsersManagement })));
const Statistics = lazy(() => import('./pages/Statistics').then(module => ({ default: module.Statistics })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const CourseManagement = lazy(() => import('./pages/CourseManagement').then(module => ({ default: module.CourseManagement })));

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
            refetchOnWindowFocus: true,
            retry: 1,
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <BrowserRouter>
                        <Suspense fallback={<LoadingSpinner message="جاري التحميل..." />}>
                            <Routes>
                                <Route path="/" element={<WelcomePage />} />
                                <Route path="/admin/select-role" element={<RoleSelection />} />
                                <Route path="/app" element={
                                    <ProtectedRoute>
                                        <AppLayout />
                                    </ProtectedRoute>
                                }>
                                    <Route index element={<Home />} />
                                    <Route path="project/:projectId" element={<ProjectDashboard />} />
                                    <Route path="profile" element={<Profile />} />
                                    <Route path="users" element={<UsersManagement />} />
                                    <Route path="stats" element={<Statistics />} />
                                    <Route path="courses" element={<CourseManagement />} />
                                </Route>
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Suspense>
                    </BrowserRouter>
                </AuthProvider>
                <ToastProvider />
            </QueryClientProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
