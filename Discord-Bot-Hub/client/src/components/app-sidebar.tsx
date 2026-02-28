import { Link, useLocation } from "wouter";
import { Ticket, Megaphone, LayoutDashboard, Bot, Settings, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Tickets", url: "/tickets", icon: Ticket },
  { title: "Announcements", url: "/announcements", icon: Megaphone },
];

const settingsItems = [
  { title: "Bot Settings", url: "#", icon: Settings },
  { title: "Support Teams", url: "#", icon: Users },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-white/5 bg-background/50 backdrop-blur-xl">
      <SidebarHeader className="p-4 flex flex-row items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-lg shadow-primary/20 ring-1 ring-primary/30">
          <Bot className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-lg leading-tight text-foreground">NexusBot</span>
          <span className="text-xs text-muted-foreground font-medium">Command Center</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      className={`
                        mb-1 transition-all duration-200 rounded-lg py-5
                        ${isActive 
                          ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-medium ring-1 ring-primary/20" 
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}
                      `}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="text-[15px]">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className="mb-1 text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg py-5 transition-all duration-200"
                  >
                    <a href={item.url} className="flex items-center gap-3 opacity-50 cursor-not-allowed" onClick={(e) => e.preventDefault()}>
                      <item.icon className="h-5 w-5" />
                      <span className="text-[15px]">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
