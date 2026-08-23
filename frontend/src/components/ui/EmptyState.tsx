import { type ReactNode } from 'react';

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="text-center py-12 px-8 bg-surface rounded-xl border-2 border-dashed border-border flex flex-col items-center gap-4">
            <div className="text-text-muted flex justify-center">
                {icon}
            </div>
            <div>
                <h3 className="m-0 mb-2 text-text-main">{title}</h3>
                <p className="text-text-muted m-0 text-[0.95rem]">{description}</p>
            </div>
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
}
