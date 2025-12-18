// app/(admin)/analytics/page.tsx
export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Top Book</p>
          <h2 className="font-semibold mt-2">Intro to Finance</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Monthly Revenue</p>
          <h2 className="font-semibold mt-2">₦180,000</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Downloads</p>
          <h2 className="font-semibold mt-2">3,420</h2>
        </div>
      </div>
    </div>
  );
}
