/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    900: '#1e3a8a',
                },
                brand: {
                    blue: '#002147', // Deep blue from logo
                    orange: '#FF6B00', // Orange from logo
                },
                secondary: '#64748b',
                accent: '#f59e0b',
                success: '#10b981',
                warning: '#fbbf24',
                error: '#ef4444',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
