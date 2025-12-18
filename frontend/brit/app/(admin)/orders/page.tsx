// app/(admin)/orders/page.tsx
export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Order ID</th>
              <th>User</th>
              <th>Book</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3">#1023</td>
              <td>john@email.com</td>
              <td>Financial Literacy</td>
              <td>₦4,500</td>
              <td className="text-green-600">Completed</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
