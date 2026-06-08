import Icon from "@/components/ui/Icon";

interface EmptyStateProps {
  icon?: string;
  title: string;
  hint?: string;
}

/** Friendly placeholder shown when a list/table has no data. */
export default function EmptyState({ icon = "search", title, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface">
        <Icon name={icon} size={20} className="text-placeholder" />
      </div>
      <span className="font-inter text-[13px] font-medium text-subtle">{title}</span>
      {hint && <span className="font-inter text-[12px] text-placeholder">{hint}</span>}
    </div>
  );
}
