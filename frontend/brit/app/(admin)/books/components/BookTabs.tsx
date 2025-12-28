interface BookTabsProps {
  active: "draft" | "published";
  onChange: (tab: "draft" | "published") => void;
}

export default function BookTabs({ active, onChange }: BookTabsProps) {
  return (
    <div className="flex gap-6 border-b mb-8">
      {(["draft", "published"] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`pb-3 capitalize ${
            active === tab
              ? "border-b-2 border-[#035b77] font-semibold"
              : "text-gray-500"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
