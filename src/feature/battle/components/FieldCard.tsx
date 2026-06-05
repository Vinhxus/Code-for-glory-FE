interface FieldCardProps {
  icon: string;
  title: string;
  description: string;
  tags: string[];
  badge?: string;
  onClick: () => void;
}

const FieldCard = ({
  icon,
  title,
  description,
  tags,
  badge,
  onClick,
}: FieldCardProps) => {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col gap-4 rounded-2xl border border-(--cg-border) bg(--cg-container-a16) p-6 text-left
      backdrop-blur-md transition-all hover:border-[#ff7e5f]/40 hover:bg-(--cg-container-a22) card-hover w-full min-h-55"
    >
      {/* Coral glow khi hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity hover:opacity-100"
        style={{
          background:
            'radial-gradient(ellipse at 0% 0%, rgba(256, 126, 95, 0.08) 0%, transparent 60%)',
        }}
      />
      {badge && (
        <span className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-(--cg-green-a14)] px-2.5 py-1 text-[11px] font-semibold text-[#4ade80]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] animate-status-pluse" />
          {badge}
        </span>
      )}

      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-(--cg-border) bg-(--cg-bg-a55) text-xl">
        {icon}
      </div>

      <div>
        <h3 className="font-['Lexend'] text-lg font-bold text-(--cg-text)">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-(--cg-text-muted)">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-lg border border-(--cg-border) bg-(--cg-container-a16) px-2.5 py-0.5 text-xs font-medium text-(--cg-text-muted)"
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
};
export default FieldCard;
