import React from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
    style?: React.CSSProperties;
    circle?: boolean;
}

export function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', className = '', style, circle = false }: SkeletonProps) {
    return (
        <div 
            className={`skeleton-loading ${className}`} 
            style={{ 
                width, 
                height, 
                borderRadius: circle ? '50%' : borderRadius, 
                ...style 
            }} 
        />
    );
}

// Komponen Pembantu untuk Layout Loading Umum
export const SkeletonDashboard = () => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem', backgroundColor: 'var(--color-dashboard-bg)' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Skeleton circle width={48} height={48} />
                    <Skeleton width={150} height={24} />
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <Skeleton circle width={24} height={24} />
                    <Skeleton circle width={24} height={24} />
                </div>
            </div>
        </div>
        <div className="dashboard-content" style={{ marginTop: '-2rem' }}>
            <div className="dashboard-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Skeleton width={120} height={24} />
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ flex: 1, padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                        <Skeleton width="60%" height={20} style={{ marginBottom: '0.5rem' }} />
                        <Skeleton width="40%" height={32} />
                    </div>
                    <div style={{ flex: 1, padding: '1.5rem', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                        <Skeleton width="60%" height={20} style={{ marginBottom: '0.5rem' }} />
                        <Skeleton width="40%" height={32} />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                <Skeleton circle width={48} height={48} />
                <div style={{ flex: 1 }}>
                    <Skeleton width="40%" height={20} style={{ marginBottom: '0.5rem' }} />
                    <Skeleton width="20%" height={16} />
                </div>
                <Skeleton width="15%" height={24} />
            </div>
        ))}
    </div>
);

export const SkeletonForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        <div>
            <Skeleton width="20%" height={20} style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="100%" height={48} />
        </div>
        <div>
            <Skeleton width="20%" height={20} style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="100%" height={48} />
        </div>
        <div>
            <Skeleton width="20%" height={20} style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="100%" height={48} />
        </div>
    </div>
);
