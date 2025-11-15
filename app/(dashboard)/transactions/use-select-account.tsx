import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { CustomSelect } from "@/components/ui/custom-select";

export const useSelectAccount = (): [
  () => JSX.Element,
  () => Promise<unknown>,
] => {
  const accountQuery = useGetAccounts();
  const accountMutation = useCreateAccount();
  const onCreateAccount = (name: string) => accountMutation.mutate({ name });
  const accountOptions = (accountQuery.data ?? []).map((account) => ({
    label: account.name,
    value: account.id,
  }));

  const [promise, setPromise] = useState<{
    resolve: (value: string | undefined) => void;
  } | null>(null);
  const selectValue = useRef<string>();

  const confirm = () =>
    new Promise((resolve, reject) => {
      setPromise({ resolve });
    });

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    promise?.resolve(selectValue.current);
    handleClose();
  };

  const handleCancel = () => {
    promise?.resolve(undefined);
    handleClose();
  };

  const ConfirmationDialog = () => (
    <Dialog open={promise !== null}>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Select Account
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Please select an account to assign these transactions.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <CustomSelect
            placeholder="Select an account"
            options={accountOptions}
            onCreate={onCreateAccount}
            onChange={(value) => (selectValue.current = value)}
            disabled={accountQuery.isLoading || accountMutation.isPending}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-black text-white hover:bg-gray-800"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return [ConfirmationDialog, confirm];
};
