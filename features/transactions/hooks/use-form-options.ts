import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useCreateCategory } from "@/features/categories/api/use-create-category";

// Account/category select options plus inline-create handlers, shared by the
// new and edit transaction sheets. Create handlers resolve to the new id so the
// form can select it right away.
export const useTransactionFormOptions = () => {
  const accountQuery = useGetAccounts();
  const categoryQuery = useGetCategories();
  const accountMutation = useCreateAccount();
  const categoryMutation = useCreateCategory();

  const create =
    (mutateAsync: (v: { name: string }) => Promise<{ data: { id: string } }>) =>
    async (name: string) => {
      try {
        return (await mutateAsync({ name })).data.id;
      } catch {
        return undefined; // the mutation already toasted
      }
    };

  return {
    accountOptions: (accountQuery.data ?? []).map((a) => ({
      label: a.name,
      value: a.id,
    })),
    categoryOptions: (categoryQuery.data ?? []).map((c) => ({
      label: c.name,
      value: c.id,
    })),
    onCreateAccount: create(accountMutation.mutateAsync),
    onCreateCategory: create(categoryMutation.mutateAsync),
    isLoading: accountQuery.isLoading || categoryQuery.isLoading,
    isPending: accountMutation.isPending || categoryMutation.isPending,
  };
};
