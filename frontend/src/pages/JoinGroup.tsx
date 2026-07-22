import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export const JoinGroup = () => {
    const navigate = useNavigate();
    const [inviteCode, setInviteCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/groups/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ inviteCode })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0] as string[];
                    throw new Error(firstError[0]); 
                }
                throw new Error(data.message || 'Gagal bergabung ke grup');

            }

            navigate('/dashboard');
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <span 
                    style={{ color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }} 
                    onClick={() => navigate('/dashboard')}
                >
                    &larr; Kembali ke Dashboard
                </span>

                <div className="auth-header" style={{ marginTop: '1rem' }}>
                    <h2>Gabung Sirkel</h2>
                    <p>Mulai catat pengeluaran bersama teman-temanmu.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    {errorMsg && <div className="auth-error-banner" style={{ backgroundColor: '#fef2f2', color: 'var(--color-error)' }}>{errorMsg}</div>}
                    
                    <Input 
                        label="Kode Grup / Sirkel" 
                        name="invite_code"
                        placeholder="Masukkan kode disini"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        required
                    />
                    <Button type="submit" fullWidth disabled={isLoading}>
                        {isLoading ? 'Bergabung...' : 'Bergabung Grup'}
                    </Button>
                </form>
            </div>
        </div>
    );
};