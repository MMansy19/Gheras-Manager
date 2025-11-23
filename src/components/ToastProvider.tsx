import { Toaster } from 'react-hot-toast';

export const ToastProvider = () => {
    return (
        <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
                duration: 4000,
                style: {
                    direction: 'rtl',
                    textAlign: 'right',
                    fontFamily: 'Cairo, sans-serif',
                },
                success: {
                    duration: 3000,
                    iconTheme: {
                        primary: '#16a34a',
                        secondary: '#fff',
                    },
                },
                error: {
                    duration: 4000,
                    iconTheme: {
                        primary: '#e11d48',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
};
