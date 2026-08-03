import React from "react";

interface SwitchProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({ label, checked, onChange }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee', margin: '0.5rem 0' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text)', marginRight: '1rem' }}>
                {label}
            </span>
            <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer', flexShrink: 0 }}>
                <input 
                    type="checkbox" 
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    style={{ opacity: 0, width: 0, height: 0 }} 
                />
                <span style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: checked ? 'var(--color-primary)' : '#ccc',
                    borderRadius: '34px', transition: '0.3s'
                }}>
                    <span style={{
                        position: 'absolute', content: '""', height: '20px', width: '20px',
                        left: checked ? '25px' : '3px', bottom: '3px',
                        backgroundColor: 'white', borderRadius: '50%', transition: '0.3s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                </span>
            </label>
        </div>
    );
};