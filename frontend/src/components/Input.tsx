import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string; // Jika ada error (misal: "Password salah"), tampilkan tulisan merah
}

// Catatan: forwardRef digunakan agar React Hook Form nanti bisa "memegang" input ini
export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, ...props }, ref) => {
        return (
            <div className="input-wrapper">
                <label className="input-label">
                    {label}
                </label>

                <input ref={ref} className={`input-field ${error ? 'input-error' : ''}`} {...props}/>

                {error && <span className="input-error-msg">{error}</span>}
            </div>
        );
    }
);