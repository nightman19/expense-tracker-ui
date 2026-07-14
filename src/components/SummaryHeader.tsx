import type { MonthSummary } from "../api";
import { BudgetBar, formatMoney } from "./BudgetBar";

function monthLabel(month: string): string {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function SummaryHeader({
  summary,
  onPrevMonth,
  onNextMonth,
  isCurrentMonth,
}: {
  summary: MonthSummary | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isCurrentMonth: boolean;
}) {
  return (
    <div className="bg-paper-raised rounded-2xl border border-line px-5 pt-5 pb-2 shadow-sm">
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevMonth}
          aria-label="Previous month"
          className="w-9 h-9 flex items-center justify-center rounded-full text-ink-soft hover:bg-line/40 active:scale-95 transition"
        >
          ‹
        </button>
        <span className="font-mono text-xs uppercase tracking-widest text-ink-soft">
          {summary ? monthLabel(summary.month) : "…"}
        </span>
        <button
          onClick={onNextMonth}
          aria-label="Next month"
          disabled={isCurrentMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full text-ink-soft hover:bg-line/40 active:scale-95 transition disabled:opacity-20 disabled:pointer-events-none"
        >
          ›
        </button>
      </div>

      <div className="text-center mt-1 mb-4">
        <span className="font-display italic text-5xl text-ink tabular">
          {summary ? formatMoney(summary.total_spent) : "—"}
        </span>
        <p className="font-body text-xs text-ink-soft mt-1">total spent</p>
      </div>

      {summary && summary.by_category.length > 0 && (
        <div className="divide-y divide-line border-t border-line -mx-5 px-5">
          {summary.by_category.map((cat) => (
            <BudgetBar key={cat.category_id ?? "uncategorized"} category={cat} />
          ))}
        </div>
      )}
    </div>
  );
}