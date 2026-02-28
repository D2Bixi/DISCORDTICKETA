import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";
import { AppSidebar } from "@/components/app-sidebar";

// Pages
import TicketsPage from "@/pages/tickets";
import TicketDetailPage from "@/pages/ticket-detail";
import AnnouncementsPage from "@/pages/announcements";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/tickets" />} />
      <Route path="/tickets" component={TicketsPage} />
      <Route path="/tickets/:id" component={TicketDetailPage} />
      <Route path="/announcements" component={AnnouncementsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Sidebar config variables
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style}>
          <div className="flex min-h-screen w-full bg-background text-foreground selection:bg-primary/30">
            <AppSidebar />
            <div className="flex flex-col flex-1 min-w-0">
              
              {/* Top Navigation Bar */}
              <header className="flex items-center justify-between h-16 px-4 border-b border-white/5 bg-card/40 backdrop-blur-xl shrink-0 sticky top-0 z-20 shadow-sm shadow-black/20">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                  <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
                  <h2 className="text-sm font-medium text-foreground hidden sm:block font-display">System Overview</h2>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Bot Online
                  </div>
                </div>
              </header>
              
              {/* Main Content Area */}
              <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                <div className="max-w-7xl mx-auto">
                  <Router />
                </div>
              </main>
              
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
