import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExpenseCardProps {
    id: string;
    description: string;
    totalAmount: string;
    expenseDate: string;
    paidByUserName: string;
    paidByUserId: string;
    currentUserId: string | null;
    myShare?: { isPaid: boolean; payments?: { status: string }[] };
}

export function ExpenseCard({ id, description, totalAmount, expenseDate, paidByUserName, paidByUserId, currentUserId, myShare }: ExpenseCardProps) {
    const navigate = useNavigate();
    
    return (
        <div 
            onClick={() => navigate(`/expenses/${id}`)}
            className="p-6 bg-surface rounded-xl shadow-sm border border-border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="m-0 text-[1.1rem] mb-1">{description}</h3>
                    <p className="m-0 text-[0.85rem] text-text-muted flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(expenseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                </div>
                <div className="text-right">
                    <p className="m-0 font-bold text-primary">Rp {Number(totalAmount).toLocaleString('id-ID')}</p>
                </div>
            </div>
            
            <div className="text-[0.85rem] text-text-muted mt-4 pt-3 border-t border-border flex justify-between items-center">
                <span>Ditalangi oleh: <strong className="text-text-main">{paidByUserId === currentUserId ? 'Kamu' : paidByUserName}</strong></span>
                
                {myShare && paidByUserId !== currentUserId && (
                    <div className="flex items-center">
                        {myShare.isPaid ? (
                            <span className="bg-success-bg text-success-text py-1 px-2 rounded text-[0.75rem] font-bold">Lunas</span>
                        ) : myShare.payments && myShare.payments.length > 0 && myShare.payments[0].status === 'pending' ? (
                            <span className="bg-amber-100 text-amber-700 border border-amber-200 py-1 px-2 rounded text-[0.75rem] font-bold">Menunggu ACC</span>
                        ) : myShare.payments && myShare.payments.length > 0 && myShare.payments[0].status === 'rejected' ? (
                            <span className="bg-error-bg text-error py-1 px-2 rounded text-[0.75rem] font-bold">Ditolak</span>
                        ) : (
                            <span className="bg-error-bg text-error py-1 px-2 rounded text-[0.75rem] font-bold">Belum Lunas</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
