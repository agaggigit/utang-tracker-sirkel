import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    fullWidth?: boolean;
}

export const Button = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}: ButtonProps) => {
    
    let variantClasses = '';
    switch (variant) {
        case 'primary':
            variantClasses = 'bg-primary text-white shadow-sm hover:bg-primary-hover hover:shadow-md hover:-translate-y-[1px]';
            break;
        case 'secondary':
            variantClasses = 'bg-surface-hover text-text-main hover:bg-border hover:shadow-sm hover:-translate-y-[1px]';
            break;
        case 'outline':
            variantClasses = 'bg-transparent text-text-main border-[1.5px] border-border hover:bg-background hover:border-text-muted';
            break;
    }

    const baseClasses = 'px-6 py-3 rounded-md font-semibold text-base cursor-pointer transition-all duration-200 ease-in-out flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

    return (
        <button 
            className={`${baseClasses} ${variantClasses} ${fullWidth ? 'w-full' : ''} ${className}`} 
            {...props}
        >
            {children}
        </button>
    );
};