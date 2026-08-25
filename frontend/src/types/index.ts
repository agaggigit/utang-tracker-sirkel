export interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

export interface Group {
    id: string;
    name: string;
    joinCode: string;
    inviteCode?: string;
    joinApprovalRequired?: boolean;
    hostId: string;
    host?: User;
    memberships?: GroupMembership[];
}

export interface GroupMembership {
    id: string;
    userId: string;
    groupId: string;
    user?: User;
    group?: Group;
}

export interface Expense {
    id: string;
    description: string;
    totalAmount: number | string;
    expenseDate: string;
    groupId: string;
    paidBy: string;
    paidByUser?: User;
    group?: Group;
    shares: ExpenseShare[];
}

export interface ExpenseShare {
    id: string;
    expenseId: string;
    userId: string;
    shareAmount: number | string;
    isPaid: boolean;
    user?: User;
    expense?: Expense;
    payments?: Payment[];
}

export interface Payment {
    id: string;
    expenseShareId: string;
    amount: number | string;
    status: 'pending' | 'verified' | 'rejected';
    note?: string;
    proofUrl?: string;
    createdAt: string;
    expenseShare?: ExpenseShare;
}

export interface Notification {
    id: string;
    userId: string;
    type: 'payment_submitted' | 'payment_verified' | 'payment_rejected' | 'join_request' | 'expense_added' | 'group_joined';
    title: string;
    message: string;
    isRead: boolean;
    data: any; // Data bisa sangat bervariasi bergantung type, bisa kita type perlahan nanti jika dibutuhkan, tapi sementara kita kasih Record<string, unknown> atau spesifik
    createdAt: string;
}

export interface JoinRequest {
    id: string;
    userId: string;
    groupId: string;
    status: 'pending' | 'approved' | 'rejected';
    user: User;
    createdAt: string;
}

// Untuk tipe spesifik pada Data Notification (Opsional namun disarankan)
export interface NotificationDataPayment {
    paymentId: string;
    expenseId?: string;
}

export interface NotificationDataJoinRequest {
    requestId: string;
    groupId: string;
}
