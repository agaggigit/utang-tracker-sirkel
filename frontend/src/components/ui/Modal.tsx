import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: ReactNode;
    children: ReactNode;
    maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, description, children, maxWidth = '400px' }: ModalProps) {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
            <div 
                className="bg-surface p-8 rounded-xl w-[90%] shadow-lg relative max-h-[90vh] overflow-y-auto"
                style={{ maxWidth }}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 bg-transparent border-none cursor-pointer text-text-muted hover:text-text-main transition-colors"
                >
                    <X size={24} />
                </button>
                <h3 className="m-0 mb-2 pr-8 text-text-main font-bold">{title}</h3>
                {description && <p className="text-text-muted text-sm mb-6 mt-0">{description}</p>}
                
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}
