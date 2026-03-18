import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

function DataTable<T extends Record<string, unknown>>({ columns, data }: DataTableProps<T>) {
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            {columns.map((col) => (
              <TableHead key={col.key} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-secondary/30">
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((row, i) => (
            <TableRow key={i} className="border-border/30 hover:bg-secondary/20 transition-colors">
              {columns.map((col) => (
                <TableCell key={col.key} className="text-sm">
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default DataTable;
