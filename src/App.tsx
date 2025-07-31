import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CreateTicket from "./pages/CreateTicket";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Layout from "./components/Layout";
import Contacts from "./pages/Contacts";
import Accounts from "./pages/Accounts";
import Deals from "./pages/Deals";
import Tasks from "./pages/Tasks";
import SupportDesk from "./pages/SupportDesk";
import SupportTicketDetail from "./pages/SupportTicketDetail"; // ✅ NEW IMPORT
import Settings from "./pages/Settings";
import SalesReporting from "./pages/SalesReporting";
import ReportsDashboard from "./pages/ReportsDashboard";
import ProjectManagement from "./pages/ProjectManagement";
import DataImportExport from "./pages/DataImportExport";
import AdminConsole from "./pages/AdminConsole";
import UserManagement from "./pages/UserManagement";
import Maintenance from "./pages/Maintenance";
import DealsReport from "./pages/DealsReport";
import ManagerDashboard from "./pages/ManagerDashboard"; // ✅ at the top

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/contacts" element={<Layout><Contacts /></Layout>} />
          <Route path="/accounts" element={<Layout><Accounts /></Layout>} />
          <Route path="/deals" element={<Layout><Deals /></Layout>} />
          <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
          <Route path="/support" element={<Layout><SupportDesk /></Layout>} />
          <Route path="/support/create" element={<Layout><CreateTicket /></Layout>} />
          <Route path="/support/ticket/:id" element={<Layout><SupportTicketDetail /></Layout>} />
          <Route path="/projects" element={<Layout><ProjectManagement /></Layout>} />
          <Route path="/reports" element={<Layout><ReportsDashboard /></Layout>} />
          <Route path="/reports/deals" element={<Layout><DealsReport /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />
          <Route path="/data-migration" element={<Layout><DataImportExport /></Layout>} />
          <Route path="/admin" element={<Layout><AdminConsole /></Layout>} />
          <Route path="/admin/users" element={<Layout><UserManagement /></Layout>} />
          <Route path="/maintenance" element={<Layout><Maintenance /></Layout>} />
	  <Route path="/dashboard" element={<Layout><ManagerDashboard /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
