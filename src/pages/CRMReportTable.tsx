import React, { useState } from "react";

interface Deal {
  ["Deal Name"]: string;
  ["Amount"]: number;
  ["Stage"]: string;
  ["Closing Date"]: string;
  ["Lead Source"]?: string;
  ["Type"]?: string;
  ["Probability (%)"]?: number;
  ["Client Facing Total"]?: number;
  ["Next Step"]?: string;
}

interface Props {
  data: Deal[];
}

const CRMReportTable: React.FC<Props> = ({ data }) => {
  const [search, setSearch] = useState("");

  const filtered = data.filter((deal) =>
    deal["Deal Name"]?.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = filtered.reduce((acc, cur) => acc + (cur.Amount || 0), 0);
  const totalForecast = filtered.reduce(
    (acc, cur) =>
      acc + ((cur.Amount || 0) * ((cur["Probability (%)"] || 0) / 100)),
    0
  );

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <input
          type="text"
          placeholder="Search deals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="text-sm text-gray-600 mt-2 sm:mt-0">
          {filtered.length} deals · ${totalAmount.toLocaleString()} total · ${totalForecast.toLocaleString()} forecast
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse border rounded shadow-sm">
          <thead className="bg-blue-50 text-left text-sm font-semibold text-gray-700">
            <tr>
              <th className="px-4 py-2 border">Deal Name</th>
              <th className="px-4 py-2 border">Stage</th>
              <th className="px-4 py-2 border">Amount</th>
              <th className="px-4 py-2 border">Probability</th>
              <th className="px-4 py-2 border">Forecast</th>
              <th className="px-4 py-2 border">Close Date</th>
              <th className="px-4 py-2 border">Lead Source</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((deal, idx) => (
              <tr key={idx} className="text-sm text-gray-800 hover:bg-gray-50">
                <td className="px-4 py-2 border">{deal["Deal Name"]}</td>
                <td className="px-4 py-2 border">{deal.Stage}</td>
                <td className="px-4 py-2 border">${deal.Amount?.toLocaleString()}</td>
                <td className="px-4 py-2 border">{deal["Probability (%)"] || 0}%</td>
                <td className="px-4 py-2 border">
                  ${((deal.Amount || 0) * ((deal["Probability (%)"] || 0) / 100)).toLocaleString()}
                </td>
                <td className="px-4 py-2 border">{deal["Closing Date"]}</td>
                <td className="px-4 py-2 border">{deal["Lead Source"] || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CRMReportTable;