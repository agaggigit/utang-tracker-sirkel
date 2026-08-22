import { type ReactNode } from 'react';

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div style={{ 
            textAlign: 'center', 
            padding: '3rem 2rem', 
            backgroundColor: 'var(--color-surface)', 
            borderRadius: '12px', 
            border: '2px dashed var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
        }}>
            <div style={{ color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'center' }}>
                {icon}
            </div>
            <div>
                <h3 style={{ margin: 0, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>{title}</h3>
                <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.95rem' }}>{description}</p>
            </div>
            {action && (
                <div style={{ marginTop: '0.5rem' }}>
                    {action}
                </div>
            )}
        </div>
    );
}
