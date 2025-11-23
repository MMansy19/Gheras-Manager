import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastProvider';
import { Home } from './pages/Home';
import { AppLayout } from './layouts/AppLayout';
import { TeamDashboard } from './pages/TeamDashboard';
import { UsersManagement } from './pages/UsersManagement';
import { Statistics } from './pages/Statistics';
import './index.css';

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
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/app" element={<AppLayout />}>
                            <Route index element={<Navigate to="/app/team/design" replace />} />
                            <Route path="team/:teamSlug" element={<TeamDashboard />} />
                            <Route path="users" element={<UsersManagement />} />
                            <Route path="stats" element={<Statistics />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
                <ToastProvider />
            </QueryClientProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
