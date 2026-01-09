export default function BookTabs({ active, onChange }: { 
  active: "draft" | "published", 
  onChange: (val: "draft" | "published") => void 
}) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
      {(["draft", "published"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            active === tab 
              ? "bg-white text-[#035b77] shadow-sm" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}s
        </button>
      ))}
    </div>
  );
}