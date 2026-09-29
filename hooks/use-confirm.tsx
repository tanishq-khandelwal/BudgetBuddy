import { useState, useSyncExternalStore, type JSX } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Options = {
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button. Defaults to true. */
  destructive?: boolean;
};

type State = {
  open: boolean;
  title: string;
  message: string;
  options: Options;
  resolve?: (value: boolean) => void;
};

// Promise-based confirm dialog: `const ok = await confirm()`.
// The dialog component is created once so it doesn't remount on re-render.
const createStore = () => {
  let state: State = { open: false, title: "", message: "", options: {} };
  const listeners = new Set<() => void>();
  const set = (next: State) => {
    state = next;
    listeners.forEach((l) => l());
  };
  return {
    get: () => state,
    set,
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
};

export const useConfirm = (
  title: string,
  message: string,
  options: Options = {},
): [() => JSX.Element, () => Promise<boolean>] => {
  const [{ store, Dialog }] = useState(() => {
    const store = createStore();
    const close = (value: boolean) => {
      const s = store.get();
      s.resolve?.(value);
      store.set({ ...s, open: false, resolve: undefined });
    };
    const Dialog = () => {
      const s = useSyncExternalStore(store.subscribe, store.get, store.get);
      const destructive = s.options.destructive ?? true;
      return (
        <AlertDialog open={s.open} onOpenChange={(o) => !o && close(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{s.title}</AlertDialogTitle>
              <AlertDialogDescription>{s.message}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => close(false)}>
                {s.options.cancelLabel ?? "Cancel"}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => close(true)}
                className={cn(
                  destructive && buttonVariants({ variant: "destructive" }),
                )}
              >
                {s.options.confirmLabel ?? "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    };
    return { store, Dialog };
  });

  const confirm = () =>
    new Promise<boolean>((resolve) => {
      store.set({ open: true, title, message, options, resolve });
    });

  return [Dialog, confirm];
};
