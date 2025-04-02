"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNewAccount } from "@/features/accounts/hooks/use-new-accounts";
import { Plus } from "lucide-react";
import { columns, Payment } from "./columns";
import { DataTable } from "@/app/components/data-table";

async function getData(): Promise<Payment[]> {
  return [
    { id: "728ed52f", amount: 100, status: "pending", email: "m@example.com" },
    { id: "728ed57f", amount: 50, status: "pending", email: "a@example.com" },
  ];
}

const AccountsPage = () => {
  const newAccount = useNewAccount();
  const [data, setData] = useState<Payment[]>([]);

  useEffect(() => {
    async function fetchData() {
      const result = await getData();
      setData(result);
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="bordere-none drop-shadow-sm bg-white">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">Accounts Page</CardTitle>
          <Button onClick={newAccount.onOpen} size="sm" className="bg-black text-white hover:bg-black">
            <Plus className="size-4 mr-2" />
            Add new
          </Button>
        </CardHeader>

        <CardContent>
          <DataTable columns={columns} data={data} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountsPage;
