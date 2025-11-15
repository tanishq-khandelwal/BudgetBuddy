"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";
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

    const url = qs.stringifyUrl(
      { url: pathname, query },
      { skipNull: true, skipEmptyString: true },
    );

    router.push(url);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full lg:w-auto">
      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        Account
      </label>
      <Select value={accountId} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="w-full lg:w-[200px] bg-white border-2 border-gray-200 hover:border-gray-300 transition-colors">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Accounts</SelectItem>
          {accounts?.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
