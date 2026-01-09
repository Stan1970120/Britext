export default function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl">
        📚
      </div>
      <p className="text-gray-500 font-medium">{text}</p>
      <p className="text-xs text-gray-400 mt-1">Start by adding a new title to your library.</p>
    </div>
  );
}