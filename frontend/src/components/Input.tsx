import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string; // Jika ada error (misal: "Password salah"), tampilkan tulisan merah
}

// Catatan: forwardRef digunakan agar React Hook Form nanti bisa "memegang" input ini
export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, ...props }, ref) => {
        return (
            <div className="flex flex-col mb-4">
                <label className="text-sm font-medium text-text-main mb-2">
                    {label}
                </label>

                <input ref={ref} className={`p-3 border-[1.5px] border-border rounded-lg text-base bg-surface-hover text-text-main transition-all duration-200 outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15 ${error ? '!border-error focus:!border-error focus:!ring-error/15' : ''} ${props.className || ''}`} {...props}/>

                {error && <span className="text-error text-xs mt-2 font-medium">{error}</span>}
            </div>
        );
    }
);