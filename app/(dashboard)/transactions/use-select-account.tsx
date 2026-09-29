"use client";

import { useState, useSyncExternalStore, type JSX } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/ui/custom-select";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";

type State = {
  open: boolean;
  count?: number;
  resolve?: (id: string | undefined) => void;
};

// Promise-based account picker: `const accountId = await pick(rowCount)`.
// Resolves undefined when cancelled. The dialog component is created once so
// the select keeps focus and its menu open across re-renders.
export const useSelectAccount = (): [
  () => JSX.Element,
  (count?: number) => Promise<string | undefined>,
] => {
  const [{ store, Picker }] = useState(() => {
    let state: State = { open: false };
    const listeners = new Set<() => void>();
    const store = {
      get: () => state,
      set: (next: State) => {
        state = next;
        listeners.forEach((l) => l());
      },
      subscribe: (l: () => void) => {
        listeners.add(l);
        return () => {
          listeners.delete(l);
        };
      },
    };

    const Body = ({ count }: { count?: number }) => {
      const accountQuery = useGetAccounts();
      const accountMutation = useCreateAccount();
      const [value, setValue] = useState<string | undefined>();
      const options = (accountQuery.data ?? []).map((a) => ({
        label: a.name,
        value: a.id,
      }));
      const close = (id?: string) => {
        state.resolve?.(id);
        store.set({ open: false });
      };

      return (
        <>
          <DialogHeader>
            <DialogTitle>Choose an account</DialogTitle>
            <DialogDescription>
              {count
                ? `Import ${count} transaction${count === 1 ? "" : "s"} into which account?`
                : "Which account should these transactions go into?"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="import-account">Account</Label>
            <CustomSelect
              id="import-account"
              placeholder="Select or create an account"
              options={options}
              value={value}
              onChange={setValue}
              onCreate={(name) =>
                accountMutation.mutate(
                  { name },
                  { onSuccess: (res) => setValue(res.data.id) },
                )
              }
              disabled={accountQuery.isLoading || accountMutation.isPending}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => close()}>
              Cancel
            </Button>
            <Button disabled={!value} onClick={() => close(value)}>
              {accountMutation.isPending && (
                <Loader2 className="animate-spin" />
              )}
              Import
            </Button>
          </DialogFooter>
        </>
      );
    };

    const PickerDialog = () => {
      const s = useSyncExternalStore(store.subscribe, store.get, store.get);
      return (
        <Dialog
          open={s.open}
          onOpenChange={(o) => {
            if (!o) {
              s.resolve?.(undefined);
              store.set({ open: false });
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            {s.open && <Body count={s.count} />}
          </DialogContent>
        </Dialog>
      );
    };
    return { store, Picker: PickerDialog };
  });

  const pick = (count?: number) =>
    new Promise<string | undefined>((resolve) => {
      store.set({ open: true, count, resolve });
    });

  return [Picker, pick];
};
