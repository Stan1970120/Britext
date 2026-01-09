export interface Transaction {
    _id: string;
    bookTitle: string;
    timestamp: string;
    amount: number;
}

export interface DashboardStats {
    totalDrafts: number;
    liveStoreCount: number;
    dailyRevenue: number;
    conversionRate: number;
    recentTransactions: Transaction[];
}