type Transaction = { id: string; description: string; amount: number; iOweThem: boolean };

type DebtValue = {
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
    // Map untuk menampung balance per pasangan user (hanya dari sudut pandang current user)
    const balances = new Map<string, { 
        userId: string, 
        name: string, 
        netAmount: number,
        transactions: Transaction[]
    }>();
    // netAmount positif = mereka utang ke aku
    // netAmount negatif = aku utang ke mereka

    for (const exp of expenses) {
        if (exp.paidBy === currentUserId) {
            // Tagihan ini ditalangi oleh aku, anggota lain utang ke aku
            for (const share of exp.shares) {
                if (share.userId === currentUserId) continue; // utang diriku sendiri diabaikan
                
                const b = balances.get(share.userId) || { userId: share.userId, name: share.user.name, netAmount: 0, transactions: [] };
                b.netAmount += share.shareAmount;
                b.transactions.push({ id: exp.id, description: exp.description, amount: share.shareAmount, iOweThem: false });
                balances.set(share.userId, b);
            }
        } else {
            // Tagihan ini ditalangi orang lain
            const myShare = exp.shares.find(s => s.userId === currentUserId);
            if (myShare) {
                // Aku berutang ke orang ini
                const b = balances.get(exp.paidBy) || { userId: exp.paidBy, name: exp.paidByUser.name, netAmount: 0, transactions: [] };
                b.netAmount -= myShare.shareAmount;
                b.transactions.push({ id: exp.id, description: exp.description, amount: myShare.shareAmount, iOweThem: true });
                balances.set(exp.paidBy, b);
            }
        }
    }

    const iOwe: DebtValue[] = [];
    const owedToMe: DebtValue[] = [];
    let totalIOwe = 0;
    let totalOwedToMe = 0;

    balances.forEach((b) => {
        if (b.netAmount > 0) {
            owedToMe.push({ userId: b.userId, name: b.name, amount: b.netAmount, transactions: b.transactions });
            totalOwedToMe += b.netAmount;
        } else if (b.netAmount < 0) {
            const amount = Math.abs(b.netAmount);
            iOwe.push({ userId: b.userId, name: b.name, amount, transactions: b.transactions });
            totalIOwe += amount;
        }
    });

    return {
        iOwe,
        owedToMe,
        totalIOwe,
        totalOwedToMe
    };
}