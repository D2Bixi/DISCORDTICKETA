import { useRoute, Link } from "wouter";
import { useTicket, useUpdateTicket } from "@/hooks/use-tickets";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { ArrowLeft, User, Hash, Clock, ShieldCheck, Ticket as TicketIcon, Lock, Loader2, AlertCircle, Send, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function TicketDetailPage() {
  const [, params] = useRoute("/tickets/:id");
  const ticketId = params?.id ? parseInt(params.id) : null;
  const [message, setMessage] = useState("");
  
  const { data: ticket, isLoading, error } = useTicket(ticketId);
  const updateTicket = useUpdateTicket();

  const { data: messages = [] } = useQuery({
    queryKey: [buildUrl(api.tickets.messages.list.path, { id: ticketId! })],
    enabled: !!ticketId,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(buildUrl(api.tickets.messages.send.path, { id: ticketId! }), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [buildUrl(api.tickets.messages.list.path, { id: ticketId! })] });
      setMessage("");
    },
  });

  if (isLoading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading ticket details...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold">Ticket Not Found</h2>
          <p className="text-muted-foreground mt-1">This ticket may have been deleted or doesn't exist.</p>
        </div>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/tickets">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tickets
          </Link>
        </Button>
      </div>
    );
  }

  const handleClaim = () => {
    updateTicket.mutate({ 
      id: ticket.id, 
      status: "claimed",
      // In a real app, claimedBy would be the current dashboard user's ID
      claimedBy: "AdminUser" 
    });
  };

  const handleClose = () => {
    updateTicket.mutate({ 
      id: ticket.id, 
      status: "closed" 
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center gap-4 mb-6">
        <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-secondary">
          <Link href="/tickets">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold text-foreground">Ticket #{ticket.id}</h1>
            <Badge variant="outline" className={`
              capitalize text-sm px-3 py-1 border 
              ${ticket.status === 'open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : ''}
              ${ticket.status === 'claimed' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : ''}
              ${ticket.status === 'closed' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30' : ''}
            `}>
              {ticket.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-panel border-white/10">
            <CardHeader className="bg-secondary/30 border-b border-white/5 pb-4">
              <CardDescription className="text-primary font-medium tracking-wide uppercase text-xs mb-1">Issue Topic</CardDescription>
              <CardTitle className="text-2xl font-display leading-tight">{ticket.topic}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/20 rounded-lg text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Creator</p>
                      <p className="text-sm text-muted-foreground font-mono">{ticket.creatorId}</p>
                    </div>
                  </div>
                  
                  <Separator orientation="vertical" className="h-10 bg-white/10" />
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-secondary rounded-lg text-foreground">
                      <Hash className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Discord Channel</p>
                      <p className="text-sm text-muted-foreground font-mono">{ticket.discordChannelId}</p>
                    </div>
                  </div>
                </div>

                {ticket.claimedBy && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                     <div className="p-2.5 bg-amber-500/20 rounded-lg text-amber-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-400/80">Claimed By</p>
                      <p className="text-base font-semibold text-amber-400">{ticket.claimedBy}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 opacity-70" />
                  <span>Opened on {ticket.createdAt ? format(new Date(ticket.createdAt), "MMMM d, yyyy 'at' h:mm a") : 'Unknown date'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/10">
            <CardHeader className="bg-secondary/30 border-b border-white/5">
              <CardTitle className="text-lg font-display">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 max-h-[400px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                {messages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-10">No messages yet.</p>
                ) : (
                  messages.map((m: any) => (
                    <div key={m.id} className={`flex flex-col ${m.isFromDashboard === "true" ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${
                        m.isFromDashboard === "true" 
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-secondary/50 border border-white/5 rounded-tl-none'
                      }`}>
                        <p className="text-xs font-bold opacity-70 mb-1">{m.authorTag}</p>
                        <p className="text-sm leading-relaxed">{m.content}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-2">
                        {format(new Date(m.timestamp), "h:mm a")}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {ticket.status !== 'closed' && (
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type a message to the user..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && message && sendMessage.mutate(message)}
                    className="bg-background/50 border-white/10"
                  />
                  <Button 
                    size="icon" 
                    disabled={!message || sendMessage.isPending}
                    onClick={() => sendMessage.mutate(message)}
                  >
                    {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="glass-panel border-white/10 h-fit">
          <CardHeader className="bg-secondary/30 border-b border-white/5">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {ticket.status === 'open' && (
              <Button 
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5" 
                size="lg"
                onClick={handleClaim}
                disabled={updateTicket.isPending}
              >
                {updateTicket.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                Claim Ticket
              </Button>
            )}
            
            {ticket.status !== 'closed' && (
              <Button 
                variant="destructive" 
                className="w-full bg-destructive/90 hover:bg-destructive shadow-lg shadow-destructive/20 transition-all hover:-translate-y-0.5" 
                size="lg"
                onClick={handleClose}
                disabled={updateTicket.isPending}
              >
                {updateTicket.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
                Close Ticket
              </Button>
            )}

            {ticket.status === 'closed' && (
              <div className="text-center p-4 rounded-lg bg-zinc-500/10 border border-zinc-500/20">
                <Lock className="h-8 w-8 text-zinc-400 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-zinc-400">This ticket is closed and archived.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
