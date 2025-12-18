interface StatsCardProps {
  title: string;
  value?: string;
  loading?: boolean;
}

export default function StatsCard({
  title,
  value,
  loading,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow border">
      <p className="text-sm text-gray-500">{title}</p>
      {loading ? (
        <div className="h-6 bg-gray-200 rounded w-20 mt-3 animate-pulse" />
      ) : (
        <h2 className="text-2xl font-semibold mt-2">{value}</h2>
      )}
    </div>
  );
}
