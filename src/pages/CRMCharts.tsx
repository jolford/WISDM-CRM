import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Deal {
  Stage: string;
  Type?: string;
  ["Lead Source"]?: string;
  Amount: number;
}

interface Props {
  data: Deal[];
}

const COLORS = ["#2563eb", "#1d4ed8", "#60a5fa", "#3b82f6", "#93c5fd", "#1e40af", "#60a5fa"];

const CRMCharts: React.FC<Props> = ({ data }) => {
  // Group by stage
  const stageMap: Record<string, number> = {};
  const leadMap: Record<string, number> = {};

  data.forEach((deal) => {
    if (deal.Stage) {
      stageMap[deal.Stage] = (stageMap[deal.Stage] || 0) + deal.Amount;
    }
    if (deal["Lead Source"]) {
      leadMap[deal["Lead Source"]] = (leadMap[deal["Lead Source"]] || 0) + deal.Amount;
    }
  });

  const stageData = Object.entries(stageMap).map(([stage, total]) => ({
    name: stage,
    value: total,
  }));

  const leadData = Object.entries(leadMap).map(([source, total]) => ({
    name: source,
    value: total,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Deals by Stage</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stageData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Deals by Lead Source</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={leadData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              fill="#2563eb"
              label
            >
              {leadData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CRMCharts;
