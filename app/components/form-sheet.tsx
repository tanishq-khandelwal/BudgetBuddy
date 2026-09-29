"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
};

// Right-side sheet used by every create/edit form: full width on phones,
// max-w-md from sm up, scrollable body.
export const FormSheet = ({
  open,
  onOpenChange,
  title,
  description,
  children,
}: Props) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
      <SheetHeader className="border-b px-5 py-4 text-left sm:px-6">
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>{description}</SheetDescription>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
    </SheetContent>
  </Sheet>
);
