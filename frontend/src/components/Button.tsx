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
    ...props
}: ButtonProps) => {
    return (
        <button className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''}`} {...props}>
            {children}
        </button>
    );
};