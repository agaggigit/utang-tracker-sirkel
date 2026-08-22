import { type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
    title: string;
    showBackButton?: boolean;
    onBack?: () => void;
    action?: ReactNode;
    subtitle?: string;
}

export function PageHeader({ title, showBackButton = true, onBack, action, subtitle }: PageHeaderProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {showBackButton && (
                    <button 
                        onClick={handleBack}
                        style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: 0, color: 'var(--color-primary)' }}
                        title="Kembali"
                    >
                        <ArrowLeft size={24} />
                    </button>
                )}
                <div>
                    <h2 style={{ margin: 0 }}>{title}</h2>
                    {subtitle && <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>{subtitle}</p>}
                </div>
            </div>
            {action && <div>{action}</div>}
        </header>
    );
}
