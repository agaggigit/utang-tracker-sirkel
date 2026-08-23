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
    <div className="flex flex-col">
        <div className="py-8 px-6 bg-dashboard-bg">
            <div className="max-w-[800px] mx-auto flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Skeleton circle width={48} height={48} />
                    <Skeleton width={150} height={24} />
                </div>
                <div className="flex gap-6">
                    <Skeleton circle width={24} height={24} />
                    <Skeleton circle width={24} height={24} />
                </div>
            </div>
        </div>
        <div className="dashboard-content -mt-8">
            <div className="dashboard-card p-8 flex flex-col gap-4">
                <Skeleton width={120} height={24} />
                <div className="flex gap-4 mt-4">
                    <div className="flex-1 p-6 border border-border rounded-xl">
                        <Skeleton width="60%" height={20} style={{ marginBottom: '0.5rem' }} />
                        <Skeleton width="40%" height={32} />
                    </div>
                    <div className="flex-1 p-6 border border-border rounded-xl">
                        <Skeleton width="60%" height={20} style={{ marginBottom: '0.5rem' }} />
                        <Skeleton width="40%" height={32} />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const SkeletonList = ({ count = 3 }: { count?: number }) => (
    <div className="flex flex-col gap-4">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-xl">
                <Skeleton circle width={48} height={48} />
                <div className="flex-1">
                    <Skeleton width="40%" height={20} style={{ marginBottom: '0.5rem' }} />
                    <Skeleton width="20%" height={16} />
                </div>
                <Skeleton width="15%" height={24} />
            </div>
        ))}
    </div>
);

export const SkeletonForm = () => (
    <div className="flex flex-col gap-6 w-full">
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
