import { BoxesIcon } from "lucide-react";

import { getParts, getPartsSummary } from "@/actions/parts";
import { PartActions } from "@/components/parts/PartActions";
import { PartSearch } from "@/components/parts/PartSearch";
import { PartSheet } from "@/components/parts/PartSheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";

type PartsPageProps = {
  searchParams?: {
    search?: string;
  };
};

export const dynamic = "force-dynamic";

function stockClassName(stockQty: number) {
  if (stockQty < 5) {
    return "text-rose-200";
  }

  if (stockQty < 10) {
    return "text-amber-200";
  }

  return "text-emerald-200";
}

export default async function PartsPage({ searchParams }: PartsPageProps) {
  const search = searchParams?.search ?? "";
  const [parts, summary] = await Promise.all([
    getParts(search),
    getPartsSummary(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Parts Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Manage stock quantities, unit prices, and manual adjustments.
          </p>
        </div>
        <PartSheet />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Parts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.totalParts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-2xl font-semibold text-rose-200">
              {summary.lowStock}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatCurrency(summary.totalInventoryValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <PartSearch defaultValue={search} />

      {parts.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-card/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Name</TableHead>
                <TableHead>Stock Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parts.map((part) => (
                <TableRow
                  key={part.id}
                  className={cn(part.stockQty < 5 && "bg-rose-400/10 hover:bg-rose-400/15")}
                >
                  <TableCell className="font-medium">{part.name}</TableCell>
                  <TableCell className={cn("font-medium", stockClassName(part.stockQty))}>
                    {part.stockQty}
                  </TableCell>
                  <TableCell>{formatCurrency(part.unitPrice)}</TableCell>
                  <TableCell>
                    <PartActions
                      part={{
                        id: part.id,
                        name: part.name,
                        stockQty: part.stockQty,
                        unitPrice: Number(part.unitPrice),
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Empty className="min-h-80 border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BoxesIcon />
            </EmptyMedia>
            <EmptyTitle>No parts found</EmptyTitle>
            <EmptyDescription>
              Add the first inventory part or adjust the search term.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
