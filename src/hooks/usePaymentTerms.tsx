
import { useFinanceSettingCrud } from "./useFinanceSettingCrud";
export interface PaymentTerm {
  id?: string;
  company_id: string;
  name: string;
  days: number;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
export function usePaymentTerms() {
  const { items, loading, error, upsertItem, deleteItem, fetchItems } = useFinanceSettingCrud<PaymentTerm>("payment_terms");
  return { items, loading, error, upsertItem, deleteItem, fetchItems };
}
