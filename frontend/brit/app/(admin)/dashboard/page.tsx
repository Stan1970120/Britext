// app/(admin)/dashboard/page.tsx
import StatsCard from "@/app/Components/admin/StatsCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Total Books" value="245" />
        <StatsCard title="Total Orders" value="89" />
        <StatsCard title="Active Users" value="1,320" />
        <StatsCard title="Revenue" value="₦540,000" />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold mb-4">Recent Activity</h2>
        <ul className="text-sm space-y-3">
          <li>📘 “Intro to Economics” uploaded</li>
          <li>🛒 Order #1024 completed</li>
          <li>👤 New student registered</li>
        </ul>
      </div>
    </div>
  );
}
