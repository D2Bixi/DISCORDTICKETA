import { useTickets } from "@/hooks/use-tickets";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Ticket as TicketIcon, Clock, User, CircleDot, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TicketsPage() {
  const { data: tickets, isLoading, error } = useTickets();

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20", icon: CircleDot };
      case 'claimed':
        return { color: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20", icon: Clock };
      case 'closed':
        return { color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20", icon: TicketIcon };
      default:
        return { color: "bg-primary/10 text-primary border-primary/20", icon: TicketIcon };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Active Tickets</h1>
            <p className="text-muted-foreground mt-1">Manage user support requests</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 rounded-xl bg-card border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-display font-bold">Failed to load tickets</h2>
        <p className="text-muted-foreground mt-2 max-w-md">We couldn't connect to the server. Please check your connection and try again.</p>
      </div>
    );
  }

  const sortedTickets = tickets ? [...tickets].sort((a, b) => {
    // Sort by status (open first) then date
    if (a.status === 'open' && b.status !== 'open') return -1;
    if (a.status !== 'open' && b.status === 'open') return 1;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  }) : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">iRACE Support Hub</h1>
          <p className="text-muted-foreground mt-1">Manage iRACE Discord inquiries and support tickets.</p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="px-3 py-1.5 text-sm bg-card border-white/10">
             Total: {tickets?.length || 0}
           </Badge>
           <Badge variant="outline" className="px-3 py-1.5 text-sm bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
             Open: {tickets?.filter(t => t.status === 'open').length || 0}
           </Badge>
        </div>
      </div>

      {sortedTickets.length === 0 ? (
        <Card className="glass-panel border-dashed border-2 flex flex-col items-center justify-center h-64 text-center">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mb-4 ring-1 ring-primary/20">
            <TicketIcon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-display font-semibold">No tickets yet</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">When users create tickets via the Discord bot, they will appear here.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTickets.map((ticket) => {
            const statusConfig = getStatusConfig(ticket.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="group block focus:outline-none focus:ring-2 focus:ring-primary rounded-xl">
                <Card className="glass-panel h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 group-hover:-translate-y-1 overflow-hidden relative">
                  {/* Decorative accent bar */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${ticket.status === 'open' ? 'bg-emerald-500' : ticket.status === 'claimed' ? 'bg-amber-500' : 'bg-zinc-600'}`} />
                  
                  <CardHeader className="pb-3 pt-5">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={`capitalize flex items-center gap-1.5 font-medium border ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {ticket.status}
                      </Badge>
                      <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                        #{ticket.id}
                      </span>
                    </div>
                    <CardTitle className="text-lg font-display line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                      {ticket.topic}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex items-center text-sm text-muted-foreground mt-2 bg-secondary/30 p-2.5 rounded-lg border border-white/5">
                      <User className="w-4 h-4 mr-2 text-primary/70" />
                      <span className="truncate flex-1 font-mono text-xs">{ticket.creatorId}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex items-center text-xs text-muted-foreground border-t border-white/5 pt-3 mt-auto">
                    <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                    {ticket.createdAt ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true }) : 'Unknown time'}
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
