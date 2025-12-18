export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-white"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#014d61]" />
        <p className="text-sm font-medium text-gray-600">
          Loading, please wait…
        </p>
      </div>
    </div>
  );
}
