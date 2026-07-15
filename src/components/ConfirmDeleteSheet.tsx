import { useState } from "react";
import type { Expense } from "../api";
import { formatMoney } from "./BudgetBar";

export function ConfirmDeleteSheet({
  expense,
  onCancel,
  onConfirm,
}: {
  expense: Expense;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    await onConfirm();
    // No need to reset `deleting` on success — this component unmounts
    // once the parent closes the sheet. Only matters if onConfirm throws,
    // but App's delete flow already falls back to a refresh either way.
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <button
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]"
      />
      <div className="relative w-full bg-paper-raised rounded-t-3xl border-t border-line px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] animate-[slideUp_0.2s_ease-out]">
        <div className="mx-auto w-10 h-1 rounded-full bg-line mb-4" />
        <h2 className="font-display italic text-2xl text-ink mb-1">Delete this entry?</h2>
        <p className="font-body text-ink-soft text-sm mb-5">
          {expense.description} — <span className="font-mono tabular">{formatMoney(expense.amount)}</span>.
          This can't be undone.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-3.5 rounded-2xl border border-line text-ink font-body font-medium active:scale-[0.98] transition disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 py-3.5 rounded-2xl bg-over text-paper-raised font-body font-medium active:scale-[0.98] transition disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}