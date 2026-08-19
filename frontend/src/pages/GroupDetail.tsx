import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Switch } from '../components/Switch';
import { Bell, Settings, AlertTriangle, ArrowLeft, Users, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const GroupDetail = () => {
    const { id } = useParams(); // Mengambil ID grup dari URL
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState<'members' | 'requests' | 'settings'>('requests');
    
    // TODO: State untuk form pengaturan
    const [groupName, setGroupName] = useState('');
    const [joinApprovalRequired, setJoinApprovalRequired] = useState(false);
    const [initialGroupName, setInitialGroupName] = useState('');
    const [initialJoinApprovalRequired, setInitialJoinApprovalRequired] = useState(false);
    const [inviteCode, setInviteCode] = useState('KODE123'); // Nanti ambil dari backend
    const [requests, setRequests] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMembersLoading, setIsMembersLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [membersErrorMsg, setMembersErrorMsg] = useState('');

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
                setInitialGroupName(data.name);
                setInitialJoinApprovalRequired(data.joinApprovalRequired);
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

    // Fungsi untuk mengambil anggota grup
    const fetchGroupMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/groups/${id}/members`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Gagal mengambil anggota grup');
            } else {
                setMembers(data); 
            }
        } catch (err: any) {
            setMembersErrorMsg(err.message);
        } finally {
            setIsMembersLoading(false);
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
            
            toast.success(data.message || 'Berhasil menyimpan perubahan!');
            fetchGroupDetails(); // Refresh detail UI setelah update berhasil
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // Mengecek apakah ada perubahan pada pengaturan
    const isSettingsChanged = groupName !== initialGroupName || joinApprovalRequired !== initialJoinApprovalRequired;

    // Otomatis panggil API saat halaman pertama kali dibuka
    useEffect(() => {
        fetchGroupDetails();
        fetchJoinRequests();
        fetchGroupMembers();
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
            toast.success(data.message); // Munculkan notifikasi sukses

        } catch (err: any) {
            toast.error("Error: " + err.message);
        }
    };

    return (
        <div className="dashboard-container" style={{ paddingTop: '2rem', maxWidth: '1000px', margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '3rem' }}>
            <div style={{ position: 'relative', marginBottom: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40px' }}>
                <button 
                    onClick={() => navigate(`/groups/${id}/expenses`)}
                    style={{ position: 'absolute', left: '0', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: 0, color: 'var(--color-primary)' }}
                    title="Kembali"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ margin: 0 }}>Pengaturan Sirkel</h2>
            </div>

            <div className="group-detail-layout">
                {/* --- MENU NAVIGASI (KIRI PADA DESKTOP, ATAS PADA MOBILE) --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button 
                        style={{ 
                            textAlign: 'left', padding: '1rem 1.5rem', borderRadius: '8px', 
                            background: activeTab === 'members' ? 'var(--color-primary)' : 'transparent', 
                            border: 'none', fontSize: '1.05rem', 
                            fontWeight: activeTab === 'members' ? 'bold' : 'normal', 
                            color: activeTab === 'members' ? 'white' : 'var(--color-text-main)', 
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' 
                        }}
                        onClick={() => setActiveTab('members')}
                    >
                        Anggota Grup <Users size={18} />
                    </button>
                    <button 
                        style={{ 
                            textAlign: 'left', padding: '1rem 1.5rem', borderRadius: '8px', 
                            background: activeTab === 'requests' ? 'var(--color-primary)' : 'transparent', 
                            border: 'none', fontSize: '1.05rem', 
                            fontWeight: activeTab === 'requests' ? 'bold' : 'normal', 
                            color: activeTab === 'requests' ? 'white' : 'var(--color-text-main)', 
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' 
                        }}
                        onClick={() => setActiveTab('requests')}
                    >
                        Antrean Join <Bell size={18} />
                    </button>
                    <button 
                        style={{ 
                            textAlign: 'left', padding: '1rem 1.5rem', borderRadius: '8px', 
                            background: activeTab === 'settings' ? 'var(--color-primary)' : 'transparent', 
                            border: 'none', fontSize: '1.05rem', 
                            fontWeight: activeTab === 'settings' ? 'bold' : 'normal', 
                            color: activeTab === 'settings' ? 'white' : 'var(--color-text-main)', 
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' 
                        }}
                        onClick={() => setActiveTab('settings')}
                    >
                        Pengaturan <Settings size={18} />
                    </button>
                </div>

                {/* --- KONTEN (KANAN PADA DESKTOP, BAWAH PADA MOBILE) --- */}
                <div>
                    {activeTab === 'members' && (
                        <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Daftar Anggota</h3>
                            
                            {isMembersLoading ? (
                                <p style={{ color: '#666' }}>Memuat anggota...</p>
                            ) : membersErrorMsg ? (
                                <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: 'var(--color-error)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertTriangle size={20} /> {membersErrorMsg}
                                </div>
                            ) : members.length === 0 ? (
                                <p style={{ color: '#666', fontStyle: 'italic' }}>Belum ada anggota di sirkel ini.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {members.map((member) => (
                                        <div key={member.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '1rem 1.5rem', backgroundColor: 'var(--color-background)',
                                            borderRadius: '12px', border: '1px solid #eee'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                    {member.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 'bold' }}>{member.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Antrean Menunggu Persetujuan</h3>
                            
                            {isLoading ? (
                                <p style={{ color: '#666' }}>Mengecek antrean...</p>
                            ) : errorMsg ? (
                                <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: 'var(--color-error)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertTriangle size={20} /> {errorMsg}
                                </div>
                            ) : requests.length === 0 ? (
                                <p style={{ color: '#666', fontStyle: 'italic' }}>Belum ada permintaan bergabung saat ini.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {requests.map((req) => (
                                        <div key={req.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '1rem 1.5rem', backgroundColor: 'var(--color-background)',
                                            borderRadius: '12px', border: '1px solid #eee'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                            <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Pengaturan Grup</h3>
                                <div className="input-wrapper">
                                    <label className="input-label">Nama Grup</label>
                                    <input 
                                        type="text" 
                                        className="input-field" 
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                    />
                                </div>

                                <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                                    <Switch
                                        label="Butuh persetujuan Admin (Host) untuk anggota baru yang bergabung" 
                                        checked={joinApprovalRequired} 
                                        onChange={(val) => setJoinApprovalRequired(val)} 
                                    />
                                </div>

                                <Button 
                                    onClick={() => fetchEditGroup({ name: groupName, joinApprovalRequired })}
                                    disabled={!isSettingsChanged}
                                    style={{ opacity: !isSettingsChanged ? 0.5 : 1, cursor: !isSettingsChanged ? 'not-allowed' : 'pointer' }}
                                >
                                    Simpan Perubahan
                                </Button>
                            </div>

                            <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Kode Undangan</h3>
                                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Berikan kode ini kepada temanmu agar mereka bisa bergabung.</p>
                                
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--color-background)', border: '1.5px dashed var(--color-border)', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px' }}>
                                        {inviteCode}
                                    </div>
                                    <Button variant="outline" onClick={() => {
                                        navigator.clipboard.writeText(inviteCode);
                                        toast.success('Kode disalin!');
                                    }} style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Salin Kode">
                                        <Copy size={20} />
                                    </Button>
                                </div>

                                <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Ganti kode undangan jika menurutmu kode lama sudah tersebar luas ke orang yang tidak diinginkan.</p>
                                    <Button variant="outline" style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }} onClick={() => {
                                        MySwal.fire({
                                            html: (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                                    <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '50%', color: '#d97706' }}>
                                                        <AlertTriangle size={48} />
                                                    </div>
                                                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>Ganti Kode Undangan?</h2>
                                                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Yakin ingin mengganti kode? Kode lama tidak akan berlaku lagi.</p>
                                                </div>
                                            ),
                                            showCancelButton: true,
                                            buttonsStyling: false,
                                            customClass: {
                                                confirmButton: 'btn btn-danger',
                                                cancelButton: 'btn btn-outline',
                                                actions: 'swal2-actions-custom'
                                            },
                                            confirmButtonText: "Ya, Ganti Kode",
                                            cancelButtonText: "Batal"
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                fetchEditGroup({ regenerateInviteCode: true });
                                            }
                                        });
                                    }}>
                                        Perbarui Kode Undangan
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
