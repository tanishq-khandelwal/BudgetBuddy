import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm bg-white">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            <Loader2 className="size-12 text-gray-300 animate-spin" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
