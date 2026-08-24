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
        <div className="w-full p-8 animate-[fadeIn_0.5s_ease-out]">
            <div className="bg-surface rounded-[1rem] py-10 px-8 shadow-lg max-w-[500px] mx-auto">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="bg-transparent border-none text-2xl cursor-pointer p-0 text-primary"
                    title="Kembali ke Dashboard"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="text-center mb-8 mt-4">
                    <h2 className="text-2xl font-bold text-primary mb-2">Gabung Sirkel</h2>
                    <p className="text-text-muted text-sm m-0">Mulai catat pengeluaran bersama teman-temanmu.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col">
                    {errorMsg && <div className="p-3 rounded-lg text-sm text-center mb-4 bg-error-bg text-error border border-error-border">{errorMsg}</div>}
                    
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