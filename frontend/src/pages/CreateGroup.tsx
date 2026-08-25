import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Switch } from "../components/Switch";
import { Check, ArrowLeft } from 'lucide-react';
import { useGroups } from '../hooks/useGroups';

export const CreateGroup = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // State untuk menyimpan kode undangan setelah grup berhasil dibuat di Backend
    const [inviteCode, setInviteCode] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [joinApprovalRequired, setJoinApprovalRequired] = useState(false);
    
    const createMutation = useGroups().useCreateGroup({
        onSuccess: (data) => {
            setInviteCode(data.group.inviteCode);
        },
        onError: (err: any) => {
            setErrorMsg(err.response?.data?.message || err.message || 'Gagal membuat grup');
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
                    <h2 className="text-2xl font-bold text-primary mb-2">Buat Sirkel Baru</h2>
                    <p className="text-text-muted text-sm m-0">Mulai catat pengeluaran bersama teman-temanmu.</p>
                </div>

                {/* TAMPILAN BERCABANG (IF-ELSE) */}
                {!inviteCode ? (
                    /* Jika belum ada kode undangan, tampilkan form pengisian */
                    <form onSubmit={handleSubmit} className="flex flex-col">
                        {errorMsg && <div className="p-3 rounded-lg text-sm text-center mb-4 bg-error-bg text-error border border-error-border">{errorMsg}</div>}
                        
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
                    <div className="text-center mt-8">
                        <div className="p-8 bg-blue-50 rounded-xl border border-dashed border-primary">
                            <p className="m-0 text-[0.875rem] text-text-muted">Kode Undangan Rahasia:</p>
                            <h1 className="tracking-[0.2em] text-primary my-4">{inviteCode}</h1>
                            <Button variant={isCopied ? "outline" : "primary"} onClick={handleCopy} fullWidth className="flex items-center justify-center gap-2">
                                {isCopied ? <><Check size={18} /> Tersalin!</> : 'Copy Kode Undangan'}
                            </Button>
                        </div>
                        <p className="mt-8 text-[0.875rem] text-text-muted">
                            Bagikan kode ini ke temanmu agar mereka bisa bergabung.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};