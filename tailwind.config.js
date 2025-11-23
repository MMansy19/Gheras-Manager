/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Cairo', 'sans-serif'],
            },
            colors: {
                // Primary brand color
                primary: {
                    DEFAULT: '#059669',
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
                // Background colors
                background: {
                    DEFAULT: '#f8fafc',
                    dark: '#1e293b',
                },
                // Surface colors (cards, panels)
                surface: {
                    DEFAULT: '#ffffff',
                    dark: '#2d3748',
                },
                // Text colors
                textPrimary: {
                    DEFAULT: '#0f172a',
                    dark: '#f1f5f9',
                },
                textSecondary: {
                    DEFAULT: '#475569',
                    dark: '#94a3b8',
                },
                // Status colors for Kanban
                statusNew: '#3b82f6',
                statusScheduled: '#a855f7',
                statusInProgress: '#f59e0b',
                statusIssue: '#e11d48',
                statusDone: '#16a34a',
                statusDocs: '#6b7280',
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: '100%',
                        textAlign: 'right',
                        direction: 'rtl',
                    },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
