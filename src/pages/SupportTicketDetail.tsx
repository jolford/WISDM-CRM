import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const SupportTicketDetail: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Review in Progress</strong><br />
            The support ticket system has been temporarily disabled while we implement critical security fixes. 
            Please contact your administrator for assistance.
          </AlertDescription>
        </Alert>
        
        <div className="bg-card p-6 rounded-lg border">
          <h1 className="text-2xl font-bold mb-4">Support Ticket Details</h1>
          <p className="text-muted-foreground">
            This feature is temporarily unavailable due to ongoing security improvements.
            We apologize for any inconvenience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupportTicketDetail;