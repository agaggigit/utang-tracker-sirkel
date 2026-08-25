import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Switch } from '../components/Switch';
import { PageHeader } from '../components/ui/PageHeader';
import { Avatar } from '../components/ui/Avatar';
import { SkeletonList } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Bell, Settings, AlertTriangle, Users, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { getErrorMessage } from '../utils/errorHandler';
import type { User, JoinRequest } from '../types';
import { AxiosError } from 'axios';
import { useGroups } from '../hooks/useGroups';

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
    const { useGroupDetail, useGroupRequests, useGroupMembers, useUpdateGroup, useReviewJoinRequest } = useGroups();
    
    const { data: groupDetail } = useGroupDetail(id);

    useEffect(() => {
        if (groupDetail) {
            setGroupName(groupDetail.name);
            setJoinApprovalRequired(groupDetail.joinApprovalRequired);
            setInitialGroupName(groupDetail.name);
            setInitialJoinApprovalRequired(groupDetail.joinApprovalRequired);
            setInviteCode(groupDetail.inviteCode);
        }
    }, [groupDetail]);

    const { data: requests = [], isLoading, error: requestError } = useGroupRequests(id);
    const errorMsg = requestError ? (requestError instanceof AxiosError && requestError.response?.status === 403) ? 'Hanya Host (Pembuat Grup) yang dapat melihat antrean ini.' : getErrorMessage(requestError) : '';

    const { data: members = [], isLoading: isMembersLoading, error: memberError } = useGroupMembers(id);
    const membersErrorMsg = memberError ? getErrorMessage(memberError) : '';

    const editGroupMutation = useUpdateGroup(id, {
        onSuccess: (data) => {
            toast.success(data.message || 'Berhasil menyimpan perubahan!');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || err.message || 'Gagal menyimpan perubahan');
        }
    });

    const approvalMutation = useReviewJoinRequest(id, {
        onSuccess: (data) => {
            toast.success(data.message || 'Berhasil mengubah status');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || err.message || 'Gagal mengubah status');
        }
    });

    const isSettingsChanged = groupName !== initialGroupName || joinApprovalRequired !== initialJoinApprovalRequired;

    return (
        <div className="dashboard-container pt-8 max-w-[1000px] mx-auto px-6 pb-12">
            <PageHeader 
                title="Pengaturan Sirkel" 
                onBack={() => navigate(`/groups/${id}/expenses`)}
            />

            <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[250px_1fr] lg:gap-12 lg:items-start mt-8">
                <div className="flex flex-col gap-2">
                    <button 
                        className={`text-left py-4 px-6 rounded-lg border-none text-[1.05rem] cursor-pointer flex items-center justify-between transition-all duration-200 ${activeTab === 'members' ? 'bg-primary font-bold text-white' : 'bg-transparent font-normal text-text-main'}`}
                        onClick={() => setActiveTab('members')}
                    >
                        Anggota Grup <Users size={18} />
                    </button>
                    <button 
                        className={`text-left py-4 px-6 rounded-lg border-none text-[1.05rem] cursor-pointer flex items-center justify-between transition-all duration-200 ${activeTab === 'requests' ? 'bg-primary font-bold text-white' : 'bg-transparent font-normal text-text-main'}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Antrean Join <Bell size={18} />
                    </button>
                    <button 
                        className={`text-left py-4 px-6 rounded-lg border-none text-[1.05rem] cursor-pointer flex items-center justify-between transition-all duration-200 ${activeTab === 'settings' ? 'bg-primary font-bold text-white' : 'bg-transparent font-normal text-text-main'}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Pengaturan <Settings size={18} />
                    </button>
                </div>

                <div>
                    {activeTab === 'members' && (
                        <div className="bg-surface p-8 rounded-xl shadow-sm">
                            <h3 className="mb-6">Daftar Anggota</h3>
                            
                            {isMembersLoading ? (
                                <SkeletonList count={3} />
                            ) : membersErrorMsg ? (
                                <div className="p-4 bg-error-bg text-error rounded-lg flex items-center gap-2">
                                    <AlertTriangle size={20} /> {membersErrorMsg}
                                </div>
                            ) : members.length === 0 ? (
                                <EmptyState 
                                    icon={<Users size={48} />}
                                    title="Belum ada anggota"
                                    description="Belum ada anggota di sirkel ini."
                                />
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {members.map((member: User) => (
                                        <div key={member.id} className="flex justify-between items-center py-4 px-6 bg-background rounded-xl border border-gray-200">
                                            <div className="flex items-center gap-4">
                                                <Avatar name={member.name} imageUrl={member.avatarUrl} />
                                                <div>
                                                    <p className="m-0 font-bold">{member.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="bg-surface p-8 rounded-xl shadow-sm">
                            <h3 className="mb-6">Antrean Menunggu Persetujuan</h3>
                            
                            {isLoading ? (
                                <SkeletonList count={2} />
                            ) : errorMsg ? (
                                <div className="p-4 bg-error-bg text-error rounded-lg flex items-center gap-2">
                                    <AlertTriangle size={20} /> {errorMsg}
                                </div>
                            ) : requests.length === 0 ? (
                                <EmptyState 
                                    icon={<Bell size={48} />}
                                    title="Antrean Kosong"
                                    description="Belum ada permintaan bergabung saat ini."
                                />
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {requests.map((req: JoinRequest) => (
                                        <div key={req.id} className="flex justify-between items-center py-4 px-6 bg-background rounded-xl border border-gray-200">
                                            <div className="flex items-center gap-4">
                                                <Avatar name={req.user.name} imageUrl={req.user.avatarUrl} />
                                                <div>
                                                    <p className="m-0 font-bold">{req.user.name}</p>
                                                    <p className="m-0 text-[0.85rem] text-gray-500">Menunggu Persetujuan</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" onClick={() => approvalMutation.mutate({ requestId: req.id, status: 'rejected' })} className="border-error text-error" disabled={approvalMutation.isPending}>
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
                            <div className="bg-surface p-8 rounded-xl shadow-sm mb-8">
                                <h3 className="mb-6">Pengaturan Grup</h3>
                                <div className="flex flex-col mb-4">
                                    <label className="text-sm font-medium text-text-main mb-2">Nama Grup</label>
                                    <input 
                                        type="text" 
                                        className="p-3 border-[1.5px] border-border rounded-lg text-base bg-surface-hover text-text-main transition-all duration-200 outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/15" 
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                    />
                                </div>

                                <div className="my-6">
                                    <Switch
                                        label="Butuh persetujuan Admin (Host) untuk anggota baru yang bergabung" 
                                        checked={joinApprovalRequired} 
                                        onChange={(val) => setJoinApprovalRequired(val)} 
                                    />
                                </div>

                                <Button 
                                    onClick={() => editGroupMutation.mutate({ name: groupName, joinApprovalRequired })}
                                    disabled={!isSettingsChanged || editGroupMutation.isPending}
                                    className={!isSettingsChanged ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                >
                                    Simpan Perubahan
                                </Button>
                            </div>

                            <div className="bg-surface p-8 rounded-xl shadow-sm">
                                <h3 className="mb-6">Kode Undangan</h3>
                                <p className="text-text-muted mb-4">Berikan kode ini kepada temanmu agar mereka bisa bergabung.</p>
                                
                                <div className="flex gap-4 items-center mb-6">
                                    <div className="py-3 px-6 bg-background border-[1.5px] border-dashed border-border rounded-lg text-[1.2rem] font-bold tracking-[2px]">
                                        {inviteCode}
                                    </div>
                                    <Button variant="outline" onClick={() => {
                                        navigator.clipboard.writeText(inviteCode);
                                        toast.success('Kode disalin!');
                                    }} className="p-3 flex items-center justify-center" title="Salin Kode">
                                        <Copy size={20} />
                                    </Button>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <p className="m-0 text-[0.85rem] text-text-muted mb-4">Ganti kode undangan jika menurutmu kode lama sudah tersebar luas ke orang yang tidak diinginkan.</p>
                                    <Button variant="outline" className="border-error text-error" onClick={() => {
                                        MySwal.fire({
                                            html: (
                                                <div className="flex flex-col items-center gap-4 mt-4">
                                                    <div className="p-4 bg-amber-100 rounded-full text-amber-600">
                                                        <AlertTriangle size={48} />
                                                    </div>
                                                    <h2 className="m-0 text-[1.25rem] font-bold text-text-main">Ganti Kode Undangan?</h2>
                                                    <p className="m-0 text-[0.95rem] text-text-muted">Yakin ingin mengganti kode? Kode lama tidak akan berlaku lagi.</p>
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
