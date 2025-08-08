import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface DealRow {
  id: string;
  name: string;
  value: number | null;
  probability: number | null;
  close_date: string | null;
  stage: string;
  deal_owner_name: string | null;
  contact_id: string | null;
}

interface NextStep {
  title: string;
  due_date: string | null;
}

export default function PipelineForecast() {
  const [rows, setRows] = useState<DealRow[]>([]);
  const [nextSteps, setNextSteps] = useState<Record<string, NextStep | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState<string | undefined>();
  const [to, setTo] = useState<string | undefined>();

  useEffect(() => {
    document.title = "Pipeline – All Deals & Forecast";
  }, []);

  const loadData = async () => {
    setLoading(true);
    const sb: any = supabase as any;
    const { data, error } = await (sb
      .from("deals")
      .select("id, name, value, probability, close_date, stage, deal_owner_name, contact_id"));
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    let list: DealRow[] = data || [];
    if (search) list = list.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
    if (from) list = list.filter(d => d.close_date && d.close_date >= from);
    if (to) list = list.filter(d => d.close_date && d.close_date <= to);

    setRows(list);

    const ids = list.map(d => d.id);
    if (ids.length) {
      const { data: tasks } = await (sb
        .from("tasks")
        .select("deal_id, title, due_date, status")
        .in("deal_id", ids as any));
      const grouped: Record<string, NextStep | undefined> = {};
      (tasks || []).forEach((t: any) => {
        if (!t.deal_id) return;
        const existing = grouped[t.deal_id];
        const a = t.due_date ? new Date(t.due_date).getTime() : Infinity;
        const b = existing?.due_date ? new Date(existing.due_date).getTime() : Infinity;
        if (!existing || a < b) grouped[t.deal_id] = { title: t.title, due_date: t.due_date };
      });
      setNextSteps(grouped);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grandTotal = useMemo(() => rows.reduce((s, r) => s + Number(r.value || 0), 0), [rows]);

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>WIS – Pipeline: All Deals & Forecast by Stage and Next Step</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-end mb-4">
            <div className="flex flex-col">
              <label className="text-sm">Search Deal</label>
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by deal name" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm">From (Close Date)</label>
              <Input type="date" value={from || ""} onChange={e => setFrom(e.target.value || undefined)} />
            </div>
            <div className="flex flex-col">
              <label className="text-sm">To (Close Date)</label>
              <Input type="date" value={to || ""} onChange={e => setTo(e.target.value || undefined)} />
            </div>
            <Button onClick={loadData} disabled={loading}>Filter</Button>
            <div className="ml-auto text-sm">Sum of Amounts: ${grandTotal.toLocaleString()}</div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal Name</TableHead>
                  <TableHead>Probability %</TableHead>
                  <TableHead>Closing Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Client Facing Total</TableHead>
                  <TableHead>Next Step</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Deal Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const step = nextSteps[r.id];
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.probability ?? 0}</TableCell>
                      <TableCell>{r.close_date ? format(new Date(r.close_date), 'MMM d, yyyy') : '-'}</TableCell>
                      <TableCell>${Number(r.value || 0).toLocaleString()}</TableCell>
                      <TableCell>${Number(r.value || 0).toLocaleString()}</TableCell>
                      <TableCell>{step ? `${step.title}${step.due_date ? ' · ' + format(new Date(step.due_date), 'MMM d, yyyy') : ''}` : '-'}</TableCell>
                      <TableCell>{String(r.stage)}</TableCell>
                      <TableCell>{r.deal_owner_name || '-'}</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell className="font-semibold">Grand Total</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="font-semibold">${grandTotal.toLocaleString()}</TableCell>
                  <TableCell className="font-semibold">${grandTotal.toLocaleString()}</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
