type Transaction = { id: string; description: string; amount: number; iOweThem: boolean };

type PersonBalance = {
    userId: string;
    name: string;
    amount: number;
    transactions: Transaction[];
}

type UserRef = {
    name: string;
}

type Share = {
    userId:  string;
    shareAmount: number;
    user: UserRef;
}

type ExpenseInput = {
    id: string;
    description: string;
    paidBy: string;
    paidByUser: UserRef;
    shares: Share[];
};

export function computeBalances(expenses: ExpenseInput[], currentUserId: string) {
    // Map untuk menampung utang orang lain ke current user
    const owedToMeMap = new Map<string, PersonBalance>();
    // Map untuk menampung utang current user ke orang lain
    const iOweMap = new Map<string, PersonBalance>();

    for (const exp of expenses) {
        if (exp.paidBy === currentUserId) {
            // Tagihan ini ditalangi oleh aku, anggota lain utang ke aku
            for (const share of exp.shares) {
                if (share.userId === currentUserId) continue; // utang diriku sendiri diabaikan
                
                const b = owedToMeMap.get(share.userId) || { userId: share.userId, name: share.user.name, amount: 0, transactions: [] };
                b.amount += share.shareAmount;
                b.transactions.push({ id: exp.id, description: exp.description, amount: share.shareAmount, iOweThem: false });
                owedToMeMap.set(share.userId, b);
            }
        } else {
            // Tagihan ini ditalangi orang lain
            const myShare = exp.shares.find(s => s.userId === currentUserId);
            if (myShare) {
                // Aku berutang ke orang ini
                const b = iOweMap.get(exp.paidBy) || { userId: exp.paidBy, name: exp.paidByUser.name, amount: 0, transactions: [] };
                b.amount += myShare.shareAmount;
                b.transactions.push({ id: exp.id, description: exp.description, amount: myShare.shareAmount, iOweThem: true });
                iOweMap.set(exp.paidBy, b);
            }
        }
    }

    const owedToMe = Array.from(owedToMeMap.values());
    const iOwe = Array.from(iOweMap.values());

    let totalOwedToMe = 0;
    for (const b of owedToMe) totalOwedToMe += b.amount;
    let totalIOwe = 0;
    for (const b of iOwe) totalIOwe += b.amount;

    return {
        iOwe,
        owedToMe,
        totalIOwe,
        totalOwedToMe
    };
}