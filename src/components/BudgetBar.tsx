import type { CategoryBreakdown } from "../api";

function formatMoney(n: number): string {
  return `GH₵${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function BudgetBar({ category }: { category: CategoryBreakdown }) {
  const hasBudget = category.budget_limit != null;
  const pct = hasBudget
    ? Math.min(100, (category.total_spent / (category.budget_limit as number)) * 100)
    : null;

  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-body font-medium text-ink truncate">{category.category_name}</span>
        <span className="font-mono tabular text-sm text-ink-soft shrink-0">
          {formatMoney(category.total_spent)}
          {hasBudget && <span className="text-ink-soft/60"> / {formatMoney(category.budget_limit as number)}</span>}
        </span>
      </div>
      {hasBudget && (
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-line overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${category.over_budget ? "bg-over" : "bg-good"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {category.over_budget && (
        <p className="mt-1 text-xs text-over font-medium">
          over by {formatMoney(Math.abs(category.budget_remaining as number))}
        </p>
      )}
    </div>
  );
}

export { formatMoney };