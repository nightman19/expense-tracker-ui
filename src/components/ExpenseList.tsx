import type { Category, Expense } from "../api";
import { formatMoney } from "./BudgetBar";

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ExpenseList({
  expenses,
  categories,
  onDelete,
}: {
  expenses: Expense[];
  categories: Category[];
  onDelete: (id: number) => void;
}) {
  const categoryName = (id: number | null) =>
    categories.find((c) => c.id === id)?.name ?? "Uncategorized";

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="font-display italic text-xl text-ink-soft">Nothing logged yet</p>
        <p className="font-body text-sm text-ink-soft/70 mt-1">Tap + to add your first entry</p>
      </div>
    );
  }

  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  return (
    <ul className="divide-y divide-line">
      {sorted.map((expense) => (
        <li key={expense.id} className="group flex items-center gap-3 py-3">
          <div className="w-14 shrink-0 font-mono text-[11px] uppercase text-ink-soft tabular">
            {formatDate(expense.date)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-ink truncate">{expense.description}</p>
            <p className="font-mono text-[11px] text-ink-soft uppercase tracking-wide">
              {categoryName(expense.category_id)}
            </p>
          </div>
          <span className="font-mono tabular text-ink shrink-0">{formatMoney(expense.amount)}</span>
          <button
            onClick={() => onDelete(expense.id)}
            aria-label={`Delete ${expense.description}`}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-ink-soft/50 hover:text-over hover:bg-over-soft transition"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}