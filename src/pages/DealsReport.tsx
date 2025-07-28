import React, { useEffect, useState } from "react";
import CRMReportTable from "../components/CRMReportTable";
import CRMCharts from "../components/CRMCharts";

const DealsReport: React.FC = () => {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    fetch("/data/deals_report_data.json")
      .then((res) => res.json())
      .then((data) => setDeals(data))
      .catch((err) => console.error("Failed to load report data", err));
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          📊 WISDM CRM Deal Forecast Report
        </h1>
        <p className="text-gray-600 mb-6">
          A pipeline overview of all deals grouped by stage, lead source, and type — powered by
          <code className="bg-gray-200 px-2 py-1 rounded ml-1">deals_report_data.json</code>.
        </p>

        <CRMReportTable data={deals} />

        <hr className="my-8 border-t border-gray-300" />

        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          📈 Visual Analytics
        </h2>
        <p className="text-gray-600 mb-6">
          View the distribution of deals by sales stage and lead source.
        </p>

        <CRMCharts data={deals} />
      </div>
    </div>
  );
};

export default DealsReport;
