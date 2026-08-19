import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Switch } from '../components/Switch';

export const GroupDetail = () => {
    const { id } = useParams(); // Mengambil ID grup dari URL
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState<'members' | 'requests' | 'settings'>('requests');
    
    // TODO: State untuk form pengaturan
    const [groupName, setGroupName] = useState('');
    const [joinApprovalRequired, setJoinApprovalRequired] = useState(false);
    const [inviteCode, setInviteCode] = useState('KODE123'); // Nanti ambil dari backend
    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    // Fungsi untuk mengambil detail grup saat ini
    const fetchGroupDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/groups/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setGroupName(data.name);
                setJoinApprovalRequired(data.joinApprovalRequired);
                setInviteCode(data.inviteCode);
            }
        } catch (err: any) {
            console.error("Gagal mengambil detail grup:", err);
        }
    };

    // Fungsi untuk mengambil antrean (memanggil GET dari Backend)
    const fetchJoinRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/groups/${id}/join-requests`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 403) {
                    setErrorMsg('Hanya Host (Pembuat Grup) yang dapat melihat antrean ini.');
                } else {
                    throw new Error(data.message || 'Gagal mengambil data');
                }
            } else {
                setRequests(data); // Simpan daftar antrean dari Backend ke state React
            }
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi untuk mengubah pengaturan grup
    const fetchEditGroup = async (updatedData: any) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/groups/${id}/edit`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(updatedData) // Kirim data apa adanya, bukan dibungkus { updatedData }
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal menyimpan pengaturan');
            }
            
            alert(data.message || 'Berhasil menyimpan perubahan!');
            fetchGroupDetails(); // Refresh detail UI setelah update berhasil
        } catch (err: any) {
            alert(err.message);
        }
    };

    // Otomatis panggil API saat halaman pertama kali dibuka
    useEffect(() => {
        fetchGroupDetails();
        fetchJoinRequests();
    }, [id]);

    // Fungsi untuk mengubah status (memanggil PATCH dari Backend)
    const handleApproval = async (requestId: string, status: 'approved' | 'rejected') => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/groups/${id}/join-requests/${requestId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status }) // Kirim 'approved' atau 'rejected' ke Backend
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal mengubah status');
            }

            // Jika sukses, refresh daftar antrean (panggil ulang API GET)
            fetchJoinRequests(); 
            alert(data.message); // Munculkan notifikasi sukses

        } catch (err: any) {
            alert("Error: " + err.message);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Button variant="outline" onClick={() => navigate(`/groups/${id}/expenses`)}>&larr; Riwayat Tagihan</Button>
                    <h2>Pengaturan Sirkel</h2>
                </div>
            </header>

            <main className="dashboard-main" style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '2rem' }}>
                    <button 
                        style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'members' ? 'bold' : 'normal', color: activeTab === 'members' ? 'var(--color-primary)' : '#666', cursor: 'pointer' }}
                        onClick={() => setActiveTab('members')}
                    >
                        Anggota Grup
                    </button>
                    <button 
                        style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'requests' ? 'bold' : 'normal', color: activeTab === 'requests' ? 'var(--color-primary)' : '#666', cursor: 'pointer' }}
                        onClick={() => setActiveTab('requests')}
                    >
                        Antrean Join 🔔
                    </button>
                    <button 
                        style={{ background: 'none', border: 'none', fontSize: '1.1rem', fontWeight: activeTab === 'settings' ? 'bold' : 'normal', color: activeTab === 'settings' ? 'var(--color-primary)' : '#666', cursor: 'pointer' }}
                        onClick={() => setActiveTab('settings')}
                    >
                        Pengaturan ⚙️
                    </button>
                </div>

                {activeTab === 'members' && (
                    <div>
                        <h3>Daftar Anggota</h3>
                        <p style={{ color: '#666' }}>Di masa depan, kita akan membuat API untuk melihat daftar anggota di sini!</p>
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div>
                        <h3 style={{ marginBottom: '1.5rem' }}>Antrean Menunggu Persetujuan</h3>
                        
                        {isLoading ? (
                            <p style={{ color: '#666' }}>Mengecek antrean...</p>
                        ) : errorMsg ? (
                            <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: 'var(--color-error)', borderRadius: '8px' }}>
                                ⚠️ {errorMsg}
                            </div>
                        ) : requests.length === 0 ? (
                            <p style={{ color: '#666', fontStyle: 'italic' }}>Belum ada permintaan bergabung saat ini.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Looping untuk menggambar daftar antrean */}
                                {requests.map((req) => (
                                    <div key={req.id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '1rem 1.5rem', backgroundColor: 'var(--color-surface)',
                                        borderRadius: '12px', border: '1px solid #eee', boxShadow: 'var(--shadow-sm)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {/* Avatar Bawaan UI Kita */}
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {req.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 'bold' }}>{req.user.name}</p>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Menunggu Persetujuan</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button variant="outline" onClick={() => handleApproval(req.id, 'rejected')} style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>
                                                Tolak
                                            </Button>
                                            <Button onClick={() => handleApproval(req.id, 'approved')}>
                                                Terima
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div>
                        <h3 style={{ marginBottom: '1.5rem' }}>Pengaturan Grup</h3>
                        
                        <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', marginBottom: '2rem' }}>
                            <div className="input-wrapper">
                                <label className="input-label">Nama Grup</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <h4 style={{ margin: 0 }}>Persetujuan Bergabung</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Host harus menyetujui anggota baru sebelum mereka bisa masuk</p>
                                </div>
                                {/* TODO: Gunakan komponen Switch.tsx di sini untuk joinApprovalRequired */}
                                <Switch
                                    label="Butuh persetujuan Admin (Host) untuk anggota baru yang bergabung" 
                                    checked={joinApprovalRequired} 
                                    onChange={(val) => setJoinApprovalRequired(val)} 
                                />
                            </div>

                            <Button onClick={() => fetchEditGroup({ name: groupName, joinApprovalRequired })}>
                                Simpan Perubahan
                            </Button>
                        </div>

                        <h3 style={{ marginBottom: '1.5rem' }}>Kode Undangan</h3>
                        <div style={{ backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee' }}>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Berikan kode ini kepada temanmu agar mereka bisa bergabung.</p>
                            
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-background)', border: '1.5px dashed var(--color-border)', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px' }}>
                                    {inviteCode}
                                </div>
                                <Button variant="outline" onClick={() => {
                                    navigator.clipboard.writeText(inviteCode);
                                    alert('Kode disalin!');
                                }}>Copy</Button>
                            </div>

                            <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                <h4 style={{ margin: 0, marginBottom: '0.5rem' }}>Keamanan</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Ganti kode undangan jika menurutmu kode lama sudah tersebar luas ke orang yang tidak diinginkan.</p>
                                <Button variant="outline" style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }} onClick={() => {
                                    if (window.confirm('Yakin ingin mengganti kode? Kode lama tidak akan berlaku lagi.')) {
                                        fetchEditGroup({ regenerateInviteCode: true });
                                    }
                                }}>
                                    Perbarui Kode
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
