"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
import { Wallet } from "lucide-react";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AccountFilter = () => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const accountId = params.get("accountId") || "all";
  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const { data: accounts, isLoading } = useGetAccounts();

  const onChange = (newValue: string) => {
    const query = {
      accountId: newValue === "all" ? undefined : newValue,
      from: from || undefined,
      to: to || undefined,
    };

    router.push(
      qs.stringifyUrl(
        { url: pathname, query },
        { skipNull: true, skipEmptyString: true },
      ),
    );
  };

  return (
    <Select value={accountId} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger
        aria-label="Filter by account"
        className="h-10 w-full gap-2 sm:w-[180px]"
      >
        <Wallet className="size-4 shrink-0 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All accounts</SelectItem>
        {accounts?.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
