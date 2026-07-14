import { useState } from "react";
import type { Category } from "../api";

export function AddExpenseSheet({
  categories,
  onClose,
  onSubmit,
  onCreateCategory,
}: {
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: { amount: number; description: string; category_id?: number }) => Promise<void>;
  onCreateCategory: (name: string) => Promise<Category>;
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(categories[0]?.id);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = parseFloat(amount);
  const canSubmit = !isNaN(parsedAmount) && parsedAmount > 0 && description.trim().length > 0 && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ amount: parsedAmount, description: description.trim(), category_id: categoryId });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that expense");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      const created = await onCreateCategory(name);
      setCategoryId(created.id);
      setNewCategoryName("");
      setAddingCategory(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create that category");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]"
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full bg-paper-raised rounded-t-3xl border-t border-line px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] animate-[slideUp_0.2s_ease-out]"
      >
        <div className="mx-auto w-10 h-1 rounded-full bg-line mb-4" />
        <h2 className="font-display italic text-2xl text-ink mb-4">Log an expense</h2>

        <label className="block mb-4">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Amount</span>
          <div className="flex items-baseline gap-1 mt-1 border-b-2 border-line focus-within:border-stamp transition-colors">
            <span className="font-mono text-2xl text-ink-soft">GH₵</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              autoFocus
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full py-2 bg-transparent text-2xl font-mono tabular text-ink outline-none placeholder:text-ink-soft/30"
            />
          </div>
        </label>

        <label className="block mb-4">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">What for</span>
          <input
            type="text"
            placeholder="Groceries, uber, coffee…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 py-2 border-b-2 border-line focus:border-stamp transition-colors bg-transparent font-body text-ink outline-none placeholder:text-ink-soft/40"
          />
        </label>

        <div className="mb-5">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Category</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-body border transition ${
                  categoryId === cat.id
                    ? "bg-stamp text-paper-raised border-stamp"
                    : "border-line text-ink-soft hover:border-ink-soft"
                }`}
              >
                {cat.name}
              </button>
            ))}
            {!addingCategory && (
              <button
                type="button"
                onClick={() => setAddingCategory(true)}
                className="px-3 py-1.5 rounded-full text-sm font-body border border-dashed border-line text-ink-soft hover:border-stamp hover:text-stamp transition"
              >
                + new
              </button>
            )}
          </div>
          {addingCategory && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                autoFocus
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-full text-sm border border-line bg-transparent outline-none focus:border-stamp"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-3 py-1.5 rounded-full text-sm font-medium bg-ink text-paper-raised"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-over mb-3">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3.5 rounded-2xl bg-ink text-paper-raised font-body font-medium disabled:opacity-30 disabled:pointer-events-none active:scale-[0.98] transition"
        >
          {submitting ? "Saving…" : "Save expense"}
        </button>
      </form>
    </div>
  );
}