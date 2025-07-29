import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function CreateTicket() {
  const [form, setForm] = useState({
    title: "",
    email: "",
    company: "",
    description: "",
    priority: "medium",
    product: "",
    attachment: null as File | null,
  });

  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    if (name === "attachment") {
      setForm((prev) => ({ ...prev, attachment: files?.[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!form.product) {
      toast({ title: "Missing Product", description: "Please select a product.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    let fileUrl = "";

    try {
      if (form.attachment) {
        const { data, error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(`tickets/${Date.now()}_${form.attachment.name}`, form.attachment);

        if (uploadError) throw new Error("File upload failed");

        const { data: publicUrl } = supabase.storage.from("attachments").getPublicUrl(data.path);
        fileUrl = publicUrl.publicUrl;
      }

      const { data: inserted, error: insertError } = await supabase.from("tickets").insert([
        {
          subject: form.title,
          email: form.email,
          customer_name: form.email?.split("@")?.[0] || "Customer",
          company: form.company,
          description: form.description,
          priority: form.priority,
          product: form.product,
          attachment_url: fileUrl,
          status: "open",
        },
      ]).select("*");

      if (insertError || !inserted || inserted.length === 0) throw insertError;

      const newTicket = inserted[0];

      // 🔄 Run automation rules
      const { data: rules } = await supabase.from("rules").select("*").eq("trigger", "ticket_created");

      for (const rule of rules || []) {
        if (evaluateConditions(JSON.stringify(rule.conditions), newTicket)) {
          await executeActions(JSON.stringify(rule.actions), newTicket);
        }
      }

      toast({ title: "✅ Ticket Created", description: "Your ticket has been logged successfully." });
      navigate("/support");
    } catch (err) {
      console.error("Submit error:", err);
      toast({ title: "Error", description: "Failed to create ticket. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const evaluateConditions = (conditionsJson: string, ticket: any) => {
    try {
      const conditions = JSON.parse(conditionsJson);
      return conditions.every((cond: any) => {
        const fieldValue = ticket[cond.field];
        switch (cond.operator) {
          case "equals": return fieldValue === cond.value;
          case "contains": return fieldValue?.includes?.(cond.value);
          case "not_equals": return fieldValue !== cond.value;
          default: return false;
        }
      });
    } catch {
      return false;
    }
  };

  const executeActions = async (actionsJson: string, ticket: any) => {
    try {
      const actions = JSON.parse(actionsJson);
      for (const action of actions) {
        if (action.type === "assign") {
          await supabase.from("tickets").update({ user_id: action.userId }).eq("id", ticket.id);
        } else if (action.type === "email") {
          // optional: call a Supabase Edge Function to send notification
          await fetch("/api/send-notification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: ticket.email,
              subject: action.subject,
              message: action.message,
            })
          });
        }
      }
    } catch (err) {
      console.warn("Action execution failed", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>🎫 Create New Ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input name="title" placeholder="Ticket subject" value={form.title} onChange={handleChange} />
          <Input name="email" placeholder="Customer email" value={form.email} onChange={handleChange} />
          <Input name="company" placeholder="Customer company" value={form.company} onChange={handleChange} />

          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={(value) => setForm((prev) => ({ ...prev, priority: value }))}>
            <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Label>Product</Label>
          <Select value={form.product} onValueChange={(value) => setForm((prev) => ({ ...prev, product: value }))}>
            <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PSIGEN">PSIGEN</SelectItem>
              <SelectItem value="FileBound">FileBound</SelectItem>
              <SelectItem value="Parascript">Parascript</SelectItem>
              <SelectItem value="WISDM">WISDM</SelectItem>
              <SelectItem value="Importer Professional">Importer Professional</SelectItem>
              <SelectItem value="ABBYY FlexiCapture">ABBYY FlexiCapture</SelectItem>
              <SelectItem value="ABBYY Vantage">ABBYY Vantage</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            name="description"
            placeholder="Describe the issue"
            value={form.description}
            onChange={handleChange}
          />

          <Input
            type="file"
            name="attachment"
            accept=".txt,.log,.png,.jpg,.jpeg,.pdf"
            onChange={handleChange}
          />

          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Ticket"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
