import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableHeaderCustomProps {
  items: string[];
  afficheAction?: boolean;
  actionWidth?: string;
}

export const TableHeaderCustom: React.FC<TableHeaderCustomProps> = ({
  items,
  afficheAction = true,
  actionWidth = "120px",
}) => {
  return (
    <TableHeader>
      <TableRow className="bg-[#0052CC] hover:bg-[#0052CC] border-none">
        {items.map((title, index) => (
          <TableHead
            key={index}
            className="px-4 py-3 text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap border-r border-white/10 last:border-r-0"
          >
            {title}
          </TableHead>
        ))}
        {afficheAction && (
          <TableHead
            className="px-4 py-3 text-xs font-semibold text-white uppercase tracking-wider text-center"
            style={{ width: actionWidth }}
          >
            Actions
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
};