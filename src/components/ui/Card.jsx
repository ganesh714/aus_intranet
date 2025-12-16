import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const Card = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            ref={ref}
            className={cn(
                'rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm',
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6', className)}
        {...props}
    />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            'text-2xl font-semibold leading-none tracking-tight text-slate-900',
            className
        )}
        {...props}
    />
));
CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
