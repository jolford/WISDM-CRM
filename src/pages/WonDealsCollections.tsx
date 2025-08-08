import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

interface CollectionsRow {
  deal_id: string;
  user_id: string;
  deal_name: string;
  deal_value: number | null;
  stage: string;
  probability: number | null;
  close_date: string | null; // ISO date
  invoiced_total: number;
  paid_total: number;
  pending_total: number;
  next_due_date: string | null; // ISO date
  has_overdue: boolean;
}

interface TaskRow {
  id: string;
  deal_id: string | null;
  title: string;
  due_date: string | null;
  status: string;
}

export default function WonDealsCollections() {
  const [rows, setRows] = useState<CollectionsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [onlyWon, setOnlyWon] = useState(true);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [from, setFrom] = useState<string | undefined>();
  const [to, setTo] = useState<string | undefined>();
  const [nextSteps, setNextSteps] = useState<Record<string, TaskRow | undefined>>({});

  useEffect(() => {
    document.title = "Won Deals – Collections & Payment Status";
  }, []);

  const loadData = async () => {
    setLoading(true);
    // select from the view; RLS on deals + invoices applies
    const sb: any = supabase as any;
    const { data, error } = await (sb
      .from("deal_collections_summary")
      .select("*"));
    if (error) {
      console.error("Failed to load collections summary", error);
      setLoading(false);
      return;
    }

    let list: CollectionsRow[] = data || [];

    // date range filter
    if (from) list = list.filter(r => r.close_date && r.close_date >= from);
    if (to) list = list.filter(r => r.close_date && r.close_date <= to);

    // only won filter (stage could be enum - compare case-insensitively)
    if (onlyWon) list = list.filter(r => String(r.stage).toLowerCase() === "won");

    setRows(list);

    // fetch next steps for these deals from tasks (earliest non-completed)
    const dealIds = list.map(r => r.deal_id);
    if (dealIds.length) {
      const { data: tasks, error: taskErr } = await (sb
        .from("tasks")
        .select("id, deal_id, title, due_date, status")
        .in("deal_id", dealIds as any));
      if (!taskErr && tasks) {
        const grouped: Record<string, TaskRow | undefined> = {};
        (tasks as TaskRow[]).forEach(t => {
          if (!t.deal_id) return;
          const existing = grouped[t.deal_id];
          const dateA = t.due_date ? new Date(t.due_date).getTime() : Infinity;
          const dateB = existing?.due_date ? new Date(existing.due_date).getTime() : Infinity;
          if (!existing || dateA < dateB) grouped[t.deal_id] = t;
        });
        setNextSteps(grouped);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyWon]);

  const totals = useMemo(() => {
    const pending = rows.reduce((sum, r) => sum + Number(r.pending_total || 0), 0);
    const invoiced = rows.reduce((sum, r) => sum + Number(r.invoiced_total || 0), 0);
    const paid = rows.reduce((sum, r) => sum + Number(r.paid_total || 0), 0);
    return { pending, invoiced, paid };
  }, [rows]);

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>WIS – Won Deals: Money Pending Collections & Payment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-end mb-4">
            <div className="flex flex-col">
              <label className="text-sm">From (Close Date)</label>
              <Input type="date" value={from || ""} onChange={e => setFrom(e.target.value || undefined)} />
            </div>
            <div className="flex flex-col">
              <label className="text-sm">To (Close Date)</label>
              <Input type="date" value={to || ""} onChange={e => setTo(e.target.value || undefined)} />
            </div>
            <div className="flex items-center gap-2">
              <input id="onlyWon" type="checkbox" className="h-4 w-4" checked={onlyWon} onChange={e => setOnlyWon(e.target.checked)} />
              <label htmlFor="onlyWon" className="text-sm">Only Won</label>
            </div>
            <Button onClick={loadData} disabled={loading}>Filter</Button>
            <div className="ml-auto text-sm">
              <span className="mr-4">Total Records: {rows.length}</span>
              <span className="mr-4">Sum Invoiced: ${totals.invoiced.toLocaleString()}</span>
              <span className="mr-4">Sum Paid: ${totals.paid.toLocaleString()}</span>
              <span>Pending: ${totals.pending.toLocaleString()}</span>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Closing Date</TableHead>
                  <TableHead>Deal Owner</TableHead>
                  <TableHead>Deal Name</TableHead>
                  <TableHead>Client Facing Total</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Status of Paid Contract or Payment Overdue</TableHead>
                  <TableHead>Date & Amount Pending</TableHead>
                  <TableHead>Next Step</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(r => {
                  const next = nextSteps[r.deal_id];
                  const status = r.pending_total > 0
                    ? (r.has_overdue ? `Overdue – $${Number(r.pending_total).toLocaleString()}` : `Pending – $${Number(r.pending_total).toLocaleString()}`)
                    : "Completed & Paid in Full";
                  const pendingCell = r.pending_total > 0
                    ? `${r.next_due_date ? format(new Date(r.next_due_date), 'MMM d, yyyy') : '-'} · $${Number(r.pending_total).toLocaleString()}`
                    : "-";
                  return (
                    <TableRow key={r.deal_id}>
                      <TableCell>{r.close_date ? format(new Date(r.close_date), 'MMM d, yyyy') : '-'}</TableCell>
                      <TableCell>{/* deal owner name if available via deals */}</TableCell>
                      <TableCell>{r.deal_name}</TableCell>
                      <TableCell>${Number(r.deal_value || 0).toLocaleString()}</TableCell>
                      <TableCell>{String(r.stage)}</TableCell>
                      <TableCell>{status}</TableCell>
                      <TableCell>{pendingCell}</TableCell>
                      <TableCell>{next ? `${next.title}${next.due_date ? ' · ' + format(new Date(next.due_date), 'MMM d, yyyy') : ''}` : '-'}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
