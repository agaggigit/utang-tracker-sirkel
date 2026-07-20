import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";

export const CreateGroup = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // State untuk menyimpan kode undangan setelah grup berhasil dibuat di Backend
    const [inviteCode, setInviteCode] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name })  // Kirim nama grup ke backend
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0] as string[];
                    throw new Error(firstError[0]); 
                }
                throw new Error(data.message || 'Gagal membuat grup');

            }
            // Jika sukses, simpan kode rahasia dari backend ke dalam state!
            setInviteCode(data.group.inviteCode);
            
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
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
                <span 
                    style={{ color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }} 
                    onClick={() => navigate('/dashboard')}
                >
                    &larr; Kembali ke Dashboard
                </span>

                <div className="auth-header" style={{ marginTop: '1rem' }}>
                    <h2>Buat Sirkel Baru</h2>
                    <p>Mulai catat pengeluaran bersama teman-temanmu.</p>
                </div>

                {/* TAMPILAN BERCABANG (IF-ELSE) */}
                {!inviteCode ? (
                    /* Jika belum ada kode undangan, tampilkan form pengisian */
                    <form onSubmit={handleSubmit} className="auth-form">
                        {errorMsg && <div className="auth-error-banner" style={{ backgroundColor: '#fef2f2', color: 'var(--color-error)' }}>{errorMsg}</div>}
                        
                        <Input 
                            label="Nama Grup / Sirkel" 
                            name="name"
                            placeholder="Misal: Trip Bali 2026"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Button type="submit" fullWidth disabled={isLoading}>
                            {isLoading ? 'Membuat...' : 'Buat Grup'}
                        </Button>
                    </form>
                ) : (
                    /* Jika kode undangan sudah ada (sukses), tampilkan kotak rahasia! */
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <div style={{ padding: '2rem', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px dashed var(--color-primary)' }}>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-light)' }}>Kode Undangan Rahasia:</p>
                            <h1 style={{ letterSpacing: '0.2em', color: 'var(--color-primary)', margin: '1rem 0' }}>{inviteCode}</h1>
                            <Button variant={isCopied ? "outline" : "primary"} onClick={handleCopy} fullWidth>
                                {isCopied ? 'Tersalin! ✅' : 'Copy Kode Undangan'}
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