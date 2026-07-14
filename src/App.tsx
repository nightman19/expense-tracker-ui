import { useEffect, useState, useCallback } from "react";
import { api, type Category, type Expense, type MonthSummary } from "./api";
import { SummaryHeader } from "./components/SummaryHeader";
import { ExpenseList } from "./components/ExpenseList";
import { AddExpenseSheet } from "./components/AddExpenseSheet";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split("-").map(Number);
  const d = new Date(year, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthDateRange(month: string): { start_date: string; end_date: string } {
  const [year, m] = month.split("-").map(Number);
  const lastDay = new Date(year, m, 0).getDate();
  return { start_date: `${month}-01`, end_date: `${month}-${String(lastDay).padStart(2, "0")}` };
}

// If we're viewing the current month, default a new expense to today's date.
// If we're browsing a past/future month, "today's day-of-month" can be an
// invalid date for that month (e.g. viewing September while today is the
// 31st) — default to the 1st of the viewed month instead, which is always valid.
function defaultExpenseDate(viewedMonth: string): string {
  if (viewedMonth === currentMonth()) {
    const now = new Date();
    return `${viewedMonth}-${String(now.getDate()).padStart(2, "0")}`;
  }
  return `${viewedMonth}-01`;
}

export default function App() {
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const { start_date, end_date } = monthDateRange(month);
      const [summaryData, expensesData, categoriesData] = await Promise.all([
        api.getSummary(month),
        api.listExpenses({ start_date, end_date }),
        api.listCategories(),
      ]);
      setSummary(summaryData);
      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Couldn't reach the API — ${err.message}`
          : "Couldn't reach the API"
      );
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  async function handleAddExpense(data: { amount: number; description: string; category_id?: number }) {
    await api.createExpense({ ...data, date: defaultExpenseDate(month) });
    await refresh();
  }

  async function handleDelete(id: number) {
    setExpenses((prev) => prev.filter((e) => e.id !== id)); // optimistic
    try {
      await api.deleteExpense(id);
      await refresh();
    } catch {
      await refresh(); // roll back to server truth on failure
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-md mx-auto px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-28">
        <header className="text-center mb-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">Ledger</p>
        </header>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-over-soft text-over text-sm font-body">{error}</div>
        )}

        <SummaryHeader
          summary={summary}
          onPrevMonth={() => setMonth((m) => shiftMonth(m, -1))}
          onNextMonth={() => setMonth((m) => shiftMonth(m, 1))}
          isCurrentMonth={month === currentMonth()}
        />

        <div className="mt-6">
          {loading ? (
            <p className="text-center text-ink-soft font-body py-8">Loading…</p>
          ) : (
            <ExpenseList expenses={expenses} categories={categories} onDelete={handleDelete} />
          )}
        </div>
      </div>

      <button
        onClick={() => setSheetOpen(true)}
        aria-label="Add expense"
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-stamp text-paper-raised text-3xl font-display shadow-lg active:scale-95 transition flex items-center justify-center"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        +
      </button>

      {sheetOpen && (
        <AddExpenseSheet
          categories={categories}
          onClose={() => setSheetOpen(false)}
          onSubmit={handleAddExpense}
          onCreateCategory={async (name) => {
            const created = await api.createCategory(name);
            setCategories((prev) => [...prev, created]);
            return created;
          }}
        />
      )}
    </div>
  );
}