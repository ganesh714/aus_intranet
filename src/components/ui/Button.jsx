import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', children, ...props }, ref) => {
    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg',
        secondary: 'bg-secondary text-white hover:bg-slate-700 shadow-md',
        outline: 'border border-slate-300 bg-transparent hover:bg-slate-100 text-slate-700',
        ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
        danger: 'bg-error text-white hover:bg-red-600 shadow-md',
    };

    const sizes = {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md text-xs',
        lg: 'h-12 px-8 rounded-md text-lg',
        icon: 'h-10 w-10 p-2 flex items-center justify-center',
    };

    return (
        <motion.button
            ref={ref}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className={cn(
                'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
});

Button.displayName = 'Button';

export { Button };
