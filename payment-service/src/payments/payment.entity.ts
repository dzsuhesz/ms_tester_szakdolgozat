export interface Payment {
    id: string;
    orderId: string;
    userId: string;
    amount: number;
    status: 'APPROVED' | 'DECLINED';
    reason?: string;
    createdAt: Date;
}