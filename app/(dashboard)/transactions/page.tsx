"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "@/app/components/data-table";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { Skeleton } from "@/components/ui/skeleton";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transaction";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { UploadButton } from "./upload-button";
import { ImportCard } from "./import-card";
import { useSelectAccount } from "./use-select-account";
import { toast } from "sonner";

const INITIAL_IMPORT_RESULTS = {
  data: [],
  errors: [],
  meta: {},
};

const TransactionsPage = () => {
  const [variant, setVariant] = useState<"LIST" | "IMPORT">("LIST");
  const [importResults, setImportResults] = useState<
    typeof INITIAL_IMPORT_RESULTS
  >(INITIAL_IMPORT_RESULTS);

  const onUpload = (results: { data: string[][] }) => {
    setImportResults(results);
    setVariant("IMPORT");
  };

  const onCancelImport = () => {
    setImportResults(INITIAL_IMPORT_RESULTS);
    setVariant("LIST");
  };

  const newTransaction = useNewTransaction();
  const createTransactions = useBulkCreateTransactions();
  const deleteTransactions = useBulkDeleteTransactions();
  const transactionsQuery = useGetTransactions();
  const transactions = transactionsQuery.data || [];

  console.log("Transactions loaded:", transactions.length, transactions);

  const [AccountDialog, confirmAccount] = useSelectAccount();

  const onSubmitImport = async (values: unknown[]) => {
    const accountId = await confirmAccount();

    if (!accountId) {
      return toast.error("Please select an account to continue.");
    }

    const data = values.map((value) => ({
      ...value,
      accountId: accountId as string,
      categoryId: null, // Set categoryId to null for imports without category
    }));

    console.log("Data being sent to API:", data);

    createTransactions.mutate(data, {
      onSuccess: () => {
        onCancelImport();
      },
    });
  };

  const isDisabled =
    transactionsQuery.isLoading ||
    deleteTransactions.isPending ||
    createTransactions.isPending;

  if (transactionsQuery.isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
        <Card className="bordere-none drop-shadow-sm bg-white">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>

          <CardContent>
            <div className="h-[500px] w-full flex items-center justify-center">
              <Loader2 className="size-6 text-slate-300 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (variant === "IMPORT") {
    return (
      <>
        <AccountDialog />
        <ImportCard
          data={importResults.data}
          onCancel={onCancelImport}
          onSubmit={onSubmitImport}
        />
      </>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="bordere-none drop-shadow-sm bg-white">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Transaction History
          </CardTitle>
          <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
            <Button
              onClick={newTransaction.onOpen}
              size="sm"
              className="w-full lg:w-auto bg-black text-white hover:bg-black rounded-md"
            >
              <Plus className="size-4 mr-2" />
              Add new
            </Button>
            <UploadButton onUpload={onUpload} />
          </div>
        </CardHeader>

        <CardContent>
          <DataTable
            filterKey="payee"
            columns={columns}
            data={transactions}
            onDelete={(row) => {
              const ids = row.map((r) => r.id);
              deleteTransactions.mutate({ ids });
            }}
            disabled={isDisabled}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;
