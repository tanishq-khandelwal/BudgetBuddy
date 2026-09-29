"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  label: string;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

// Kebab menu with Edit / Delete, shared by the accounts, categories and
// transactions lists.
export const RowActions = ({ label, onEdit, onDelete, disabled }: Props) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        aria-label={`Actions for ${label}`}
      >
        <MoreHorizontal />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem disabled={disabled} onClick={onEdit}>
        <Pencil className="mr-2 size-4" />
        Edit
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={disabled}
        onClick={onDelete}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 className="mr-2 size-4" />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
