import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const JoinGroup = () => {
    const navigate = useNavigate();
    const [inviteCode, setInviteCode] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const queryClient = useQueryClient();
    
    const joinMutation = useMutation({
        mutationFn: async (code: string) => {
            const response = await api.post('/groups/join', { inviteCode: code });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            navigate('/dashboard');
        },
        onError: (err: any) => {
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0] as string[];
                    setErrorMsg(firstError[0]);
                } else {
                    setErrorMsg(data.message || 'Gagal bergabung ke grup');
                }
            } else {
                setErrorMsg(err.message);
            }
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        joinMutation.mutate(inviteCode);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <button 
                    onClick={() => navigate('/dashboard')}
                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: 0, color: 'var(--color-primary)' }}
                    title="Kembali ke Dashboard"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="auth-header" style={{ marginTop: '1rem' }}>
                    <h2>Gabung Sirkel</h2>
                    <p>Mulai catat pengeluaran bersama teman-temanmu.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    {errorMsg && <div className="auth-error-banner" style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)' }}>{errorMsg}</div>}
                    
                    <Input 
                        label="Kode Grup / Sirkel" 
                        name="invite_code"
                        placeholder="Masukkan kode disini"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        required
                    />
                    <Button type="submit" fullWidth disabled={joinMutation.isPending}>
                        {joinMutation.isPending ? 'Bergabung...' : 'Bergabung Grup'}
                    </Button>
                </form>
            </div>
        </div>
    );
};