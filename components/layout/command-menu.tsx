"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Plus, Search, Sun, Tags, Wallet } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useNewAccount } from "@/features/accounts/hooks/use-new-accounts";
import { useNewCategory } from "@/features/categories/hooks/use-new-category";
import { NAV_ITEMS } from "./nav-config";

// ⌘K / Ctrl+K palette: jump to any page or start a common action.
export const CommandMenu = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const newTransaction = useNewTransaction();
  const newAccount = useNewAccount();
  const newCategory = useNewCategory();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-9 w-full justify-start gap-2 rounded-lg bg-muted/40 px-3 font-normal text-muted-foreground shadow-none hover:bg-muted sm:w-64"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search or jump to…</span>
        <kbd className="pointer-events-none hidden select-none items-center gap-0.5 rounded border bg-background px-1.5 font-mono text-[10px] font-medium sm:inline-flex">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick actions">
            <CommandItem onSelect={() => run(newTransaction.onOpen)}>
              <Plus /> New transaction
              <CommandShortcut>N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => run(newAccount.onOpen)}>
              <Wallet /> New account
            </CommandItem>
            <CommandItem onSelect={() => run(newCategory.onOpen)}>
              <Tags /> New category
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Go to">
            {NAV_ITEMS.map((item) => (
              <CommandItem
                key={item.href}
                value={`${item.label} ${item.description}`}
                onSelect={() => run(() => router.push(item.href))}
              >
                <item.icon />
                <span>{item.label}</span>
                <span className="ml-2 truncate text-xs text-muted-foreground">
                  {item.description}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Appearance">
            <CommandItem
              onSelect={() =>
                run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))
              }
            >
              {resolvedTheme === "dark" ? <Sun /> : <Moon />}
              Switch to {resolvedTheme === "dark" ? "light" : "dark"} mode
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};
