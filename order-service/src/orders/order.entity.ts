export interface Order {
  id: string;
  userId: string;
  item: string;
  amount: number;
  status: 'CREATED' | 'PAID' | 'PAYMENT_FAILED';
  createdAt: Date;
  
}