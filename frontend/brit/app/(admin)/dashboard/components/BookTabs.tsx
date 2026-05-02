'use client';

type TabType = "draft" | "published" | "broadcast" | "delete";

export default function BookTabs({ active, onChange }: { 
  active: TabType, 
  onChange: (val: TabType) => void 
}) {
  const tabs: TabType[] = ["published", "draft", "broadcast", "delete"];

  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            active === tab 
              ? "bg-white text-[#035b77] shadow-sm" 
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {/* Custom labeling logic to handle "Publisheds" vs "Delete" */}
          {tab === "delete" 
            ? "Delete" 
            : tab.charAt(0).toUpperCase() + tab.slice(1) + "s"}
        </button>
      ))}
    </div>
  );
}

/*
export default function BookTabs({ active, onChange }: { 
  active: "draft" | "published" | "broadcast", 
  onChange: (val: "draft" | "published" | "broadcast") => void 
}) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
      {(["draft", "published", "broadcast"] as const).map((tab) => (
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
  */