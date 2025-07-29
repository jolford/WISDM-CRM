import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Ticket {
  id: string;
  subject: string;
  customer_name: string;
  email: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender: "Customer" | "Agent";
  sender_name: string;
  message: string;
  timestamp: string;
}

export default function SupportTicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTicketAndMessages(id);
    }
  }, [id]);

  const fetchTicketAndMessages = async (ticketId: string) => {
    setLoading(true);
    const { data: ticket } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    const { data: messages } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("timestamp", { ascending: true });

    setTicket(ticket);
    setMessages(messages ?? []);
    setLoading(false);
  };

  const handleSendReply = async () => {
    if (!newReply.trim() || !ticket) return;

    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: ticket.id,
      sender: "Agent",
      sender_name: "Support Team",
      message: newReply.trim(),
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error("Reply failed:", error.message);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        ticket_id: ticket.id,
        sender: "Agent",
        sender_name: "Support Team",
        message: newReply.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);
    setNewReply("");
  };

  if (loading || !ticket) {
    return <div className="p-6">Loading ticket...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{ticket.subject}</h1>
        <p className="text-sm text-gray-600 mt-1">
          <strong>From:</strong> {ticket.customer_name} ({ticket.email}) <br />
          <strong>Status:</strong> {ticket.status} |{" "}
          <strong>Priority:</strong> {ticket.priority}
        </p>
      </div>

      {/* Message Thread */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto border rounded p-4 bg-gray-50 mb-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "Customer" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-lg shadow text-sm ${
                msg.sender === "Customer"
                  ? "bg-white text-left text-gray-800 border"
                  : "bg-blue-100 text-right text-gray-800"
              }`}
            >
              <div className="font-semibold text-xs text-gray-500 mb-1">
                {msg.sender_name} ·{" "}
                {new Date(msg.timestamp).toLocaleString()}
              </div>
              <div className="whitespace-pre-wrap">{msg.message}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Input */}
      <div className="bg-white border rounded p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Reply</h3>
        <textarea
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          rows={4}
          className="w-full p-2 border rounded text-sm focus:outline-none focus:ring"
          placeholder="Type your reply..."
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSendReply}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Send Reply
          </button>
        </div>
      </div>
    </div>
  );
}
