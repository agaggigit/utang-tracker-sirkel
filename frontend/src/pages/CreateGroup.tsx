import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Switch } from "../components/Switch";
import { Check, ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const CreateGroup = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // State untuk menyimpan kode undangan setelah grup berhasil dibuat di Backend
    const [inviteCode, setInviteCode] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [joinApprovalRequired, setJoinApprovalRequired] = useState(false);
    
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (payload: { name: string, joinApprovalRequired: boolean }) => {
            const response = await api.post('/groups', payload);
            return response.data;
        },
        onSuccess: (data) => {
            setInviteCode(data.group.inviteCode);
            queryClient.invalidateQueries({ queryKey: ['groups'] });
        },
        onError: (err: any) => {
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0] as string[];
                    setErrorMsg(firstError[0]);
                } else {
                    setErrorMsg(data.message || 'Gagal membuat grup');
                }
            } else {
                setErrorMsg(err.message);
            }
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        createMutation.mutate({ name, joinApprovalRequired });
    };

    // Fungsi canggih untuk menyalin teks (berjalan di browser modern)
    const handleCopy = () => {
        navigator.clipboard.writeText(inviteCode);
        setIsCopied(true);

        // Ubah tombol kembali menjadi "Copy" setelah 3 detik
        setTimeout(() => setIsCopied(false), 3000);
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
                    <h2>Buat Sirkel Baru</h2>
                    <p>Mulai catat pengeluaran bersama teman-temanmu.</p>
                </div>

                {/* TAMPILAN BERCABANG (IF-ELSE) */}
                {!inviteCode ? (
                    /* Jika belum ada kode undangan, tampilkan form pengisian */
                    <form onSubmit={handleSubmit} className="auth-form">
                        {errorMsg && <div className="auth-error-banner" style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)' }}>{errorMsg}</div>}
                        
                        <Input 
                            label="Nama Grup / Sirkel" 
                            name="name"
                            placeholder="Misal: Trip Bali 2026"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Switch
                            label="Butuh persetujuan Admin (Host) untuk anggota baru yang bergabung"
                            checked={joinApprovalRequired}
                            onChange={(val) => setJoinApprovalRequired(val)}
                        />
                        <Button type="submit" fullWidth disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Membuat...' : 'Buat Grup'}
                        </Button>
                    </form>
                ) : (
                    /* Jika kode undangan sudah ada (sukses), tampilkan kotak rahasia! */
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <div style={{ padding: '2rem', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px dashed var(--color-primary)' }}>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-light)' }}>Kode Undangan Rahasia:</p>
                            <h1 style={{ letterSpacing: '0.2em', color: 'var(--color-primary)', margin: '1rem 0' }}>{inviteCode}</h1>
                            <Button variant={isCopied ? "outline" : "primary"} onClick={handleCopy} fullWidth style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                {isCopied ? <><Check size={18} /> Tersalin!</> : 'Copy Kode Undangan'}
                            </Button>
                        </div>
                        <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
                            Bagikan kode ini ke temanmu agar mereka bisa bergabung.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};