// Base URL comes from an env var so it's easy to point at localhost while
// developing and at your deployed backend once it's hosted. Vite exposes
// anything prefixed VITE_ on import.meta.env.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export interface Category {
  id: number;
  name: string;
  color: string | null;
}

export interface Expense {
  id: number;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  category_id: number | null;
}

export interface Budget {
  id: number;
  category_id: number;
  monthly_limit: number;
}

export interface CategoryBreakdown {
  category_id: number | null;
  category_name: string;
  total_spent: number;
  budget_limit: number | null;
  budget_remaining: number | null;
  over_budget: boolean;
}

export interface MonthSummary {
  month: string;
  total_spent: number;
  by_category: CategoryBreakdown[];
}

// Only set on the deployed version — the backend skips the auth check
// entirely when its own API_KEY env var is unset, so local dev needs nothing
// here. Once deployed, this MUST be set to the same value as the backend's
// API_KEY, or every request will get a 401.
const API_KEY = import.meta.env.VITE_API_KEY;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
      ...options?.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${response.status}`);
  }
  // 204 No Content has no body to parse
  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  listCategories: () => request<Category[]>("/categories"),
  createCategory: (name: string, color?: string) =>
    request<Category>("/categories", { method: "POST", body: JSON.stringify({ name, color }) }),

  listExpenses: (params?: { category_id?: number; start_date?: string; end_date?: string }) => {
    const query = new URLSearchParams();
    if (params?.category_id != null) query.set("category_id", String(params.category_id));
    if (params?.start_date) query.set("start_date", params.start_date);
    if (params?.end_date) query.set("end_date", params.end_date);
    const qs = query.toString();
    return request<Expense[]>(`/expenses${qs ? `?${qs}` : ""}`);
  },
  createExpense: (data: { amount: number; description: string; date?: string; category_id?: number }) =>
    request<Expense>("/expenses", { method: "POST", body: JSON.stringify(data) }),
  deleteExpense: (id: number) => request<void>(`/expenses/${id}`, { method: "DELETE" }),

  listBudgets: () => request<Budget[]>("/budgets"),
  createBudget: (category_id: number, monthly_limit: number) =>
    request<Budget>("/budgets", { method: "POST", body: JSON.stringify({ category_id, monthly_limit }) }),

  getSummary: (month?: string) => request<MonthSummary>(`/summary${month ? `?month=${month}` : ""}`),
};