import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["#4f46e5", "#f59e0b", "#10b981", "#ef4444"];

export default function ManagerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTicketData();
  }, []);

  const fetchTicketData = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*");

    if (!error) {
      setTickets(data);
    }
    setLoading(false);
  };

  const getSummaryStats = () => {
    const total = tickets.length;
    const active = tickets.filter(t => ["open", "in_progress"].includes(t.status)).length;
    const resolvedThisWeek = tickets.filter(t => {
      const resolvedDate = new Date(t.updated_at);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return t.status === "completed" && resolvedDate >= oneWeekAgo;
    }).length;
    const avgResolution = "2.8 hrs"; // Placeholder

    return { total, active, resolvedThisWeek, avgResolution };
  };

  const getBarChartData = () => {
    const counts = {};
    tickets.forEach(t => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  };

  const getPieChartData = () => {
    const counts = {};
    tickets.forEach(t => {
      counts[t.priority] = (counts[t.priority] || 0) + 1;
    });
    return Object.entries(counts).map(([priority, count]) => ({ priority, value: count }));
  };

  const getLineChartData = () => {
    const dailyCounts = {};
    tickets.forEach(t => {
      const date = new Date(t.created_at).toISOString().slice(0, 10);
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    return Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));
  };

  const { total, active, resolvedThisWeek, avgResolution } = getSummaryStats();
  const barData = getBarChartData();
  const pieData = getPieChartData();
  const lineData = getLineChartData();

  if (loading) {
    return <div className="p-6 text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">📊 Manager Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold">{total}</div><p className="text-sm text-muted-foreground">Total Tickets</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-blue-600">{active}</div><p className="text-sm text-muted-foreground">Active Tickets</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-green-600">{resolvedThisWeek}</div><p className="text-sm text-muted-foreground">Resolved This Week</p></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-purple-600">{avgResolution}</div><p className="text-sm text-muted-foreground">Avg. Resolution Time</p></CardContent></Card>
      </div>

      {/* Bar Chart: Status */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Tickets by Status</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart: Priority */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Tickets by Priority</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="priority" cx="50%" cy="50%" outerRadius={100}>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart: Daily Created */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Ticket Volume (Last 14 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
