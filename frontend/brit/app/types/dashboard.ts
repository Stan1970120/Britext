// app/types/dashboard.ts
export interface DashboardStats {
    totalBooks: number;
    totalOrders: number;
    activeUsers: number;
    revenue: number;
}

export interface Activity {
    type: "book" | "order" | "user";
    message: string;
}

export interface DashboardResponse {
    stats: DashboardStats;
    recentActivity: Activity[];
}
