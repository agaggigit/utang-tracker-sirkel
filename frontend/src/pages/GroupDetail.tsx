import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Switch } from '../components/Switch';
import { PageHeader } from '../components/ui/PageHeader';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { Bell, Settings, AlertTriangle, Users, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import api from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const MySwal = withReactContent(Swal);

export const GroupDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState<'members' | 'requests' | 'settings'>('requests');
    
    const [groupName, setGroupName] = useState('');
    const [joinApprovalRequired, setJoinApprovalRequired] = useState(false);
    const [initialGroupName, setInitialGroupName] = useState('');
    const [initialJoinApprovalRequired, setInitialJoinApprovalRequired] = useState(false);
    const [inviteCode, setInviteCode] = useState('KODE123');
    const queryClient = useQueryClient();
    
    const { data: groupDetail } = useQuery({
        queryKey: ['groups', id],
        queryFn: async () => {
            const response = await api.get(`/groups/${id}`);
            return response.data;
        }
    });

    useEffect(() => {
        if (groupDetail) {
            setGroupName(groupDetail.name);
            setJoinApprovalRequired(groupDetail.joinApprovalRequired);
            setInitialGroupName(groupDetail.name);
            setInitialJoinApprovalRequired(groupDetail.joinApprovalRequired);
            setInviteCode(groupDetail.inviteCode);
        }
    }, [groupDetail]);

    const { data: requests = [], isLoading, error: requestError } = useQuery({
        queryKey: ['groups', id, 'join-requests'],
        queryFn: async () => {
            const response = await api.get(`/groups/${id}/join-requests`);
            return response.data;
        },
        retry: false
    });
    const errorMsg = requestError ? (requestError as any).response?.status === 403 ? 'Hanya Host (Pembuat Grup) yang dapat melihat antrean ini.' : (requestError as any).response?.data?.message || (requestError as any).message : '';

    const { data: members = [], isLoading: isMembersLoading, error: memberError } = useQuery({
        queryKey: ['groups', id, 'members'],
        queryFn: async () => {
            const response = await api.get(`/groups/${id}/members`);
            return response.data;
        }
    });
    const membersErrorMsg = memberError ? (memberError as any).response?.data?.message || (memberError as any).message : '';

    const editGroupMutation = useMutation({
        mutationFn: async (updatedData: any) => {
            const response = await api.patch(`/groups/${id}`, updatedData);
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Berhasil menyimpan perubahan!');
            queryClient.invalidateQueries({ queryKey: ['groups', id] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || err.message);
        }
    });

    const approvalMutation = useMutation({
        mutationFn: async ({ requestId, status }: { requestId: string, status: 'approved' | 'rejected' }) => {
            const response = await api.patch(`/groups/${id}/join-requests/${requestId}`, { status });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Berhasil mengubah status');
            queryClient.invalidateQueries({ queryKey: ['groups', id, 'join-requests'] });
            queryClient.invalidateQueries({ queryKey: ['groups', id, 'members'] });
        },
        onError: (err: any) => {
            toast.error("Error: " + (err.response?.data?.message || err.message));
        }
    });

    const isSettingsChanged = groupName !== initialGroupName || joinApprovalRequired !== initialJoinApprovalRequired;

    return (
        <div className="dashboard-container" style={{ paddingTop: '2rem', maxWidth: '1000px', margin: '0 auto', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingBottom: '3rem' }}>
            <PageHeader 
                title="Pengaturan Sirkel" 
                onBack={() => navigate(`/groups/${id}/expenses`)}
            />

            <div className="group-detail-layout" style={{ marginTop: '2rem' }}>
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
                                <EmptyState 
                                    icon={<Users size={48} />}
                                    title="Belum ada anggota"
                                    description="Belum ada anggota di sirkel ini."
                                />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {members.map((member: any) => (
                                        <div key={member.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '1rem 1.5rem', backgroundColor: 'var(--color-background)',
                                            borderRadius: '12px', border: '1px solid #eee'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <Avatar name={member.name} imageUrl={member.avatarUrl} />
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
                                <EmptyState 
                                    icon={<Bell size={48} />}
                                    title="Antrean Kosong"
                                    description="Belum ada permintaan bergabung saat ini."
                                />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {requests.map((req: any) => (
                                        <div key={req.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '1rem 1.5rem', backgroundColor: 'var(--color-background)',
                                            borderRadius: '12px', border: '1px solid #eee'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <Avatar name={req.user.name} imageUrl={req.user.avatarUrl} />
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 'bold' }}>{req.user.name}</p>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Menunggu Persetujuan</p>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <Button variant="outline" onClick={() => approvalMutation.mutate({ requestId: req.id, status: 'rejected' })} style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }} disabled={approvalMutation.isPending}>
                                                    Tolak
                                                </Button>
                                                <Button onClick={() => approvalMutation.mutate({ requestId: req.id, status: 'approved' })} disabled={approvalMutation.isPending}>
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
                                    onClick={() => editGroupMutation.mutate({ name: groupName, joinApprovalRequired })}
                                    disabled={!isSettingsChanged || editGroupMutation.isPending}
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
                                                editGroupMutation.mutate({ regenerateInviteCode: true });
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
