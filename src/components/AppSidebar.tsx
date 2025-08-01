import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Target, 
  CheckSquare, 
  Settings,
  Plus,
  Headphones,
  BarChart3,
  FolderKanban,
  Shield,
  Wrench
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { QuickAddDialog } from "./QuickAddDialog"

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Accounts", url: "/accounts", icon: Building2 },
  { title: "Deals", url: "/deals", icon: Target },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Reports", url: "/reports", icon: BarChart3 },
]

const taskItems = [
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
]

const supportItems = [
  { title: "Support Desk", url: "/support", icon: Headphones },
]

const maintenanceItems = [
  { title: "Software and Hardware Maintenance", url: "/maintenance", icon: Wrench },
]

const systemItems = [
  { title: "Admin", url: "/admin", icon: Shield },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { open } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/"
    }
    return currentPath.startsWith(path)
  }

  const getNavCls = (path: string) =>
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium hover:bg-primary/90" 
      : "hover:bg-accent"

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/167bbb76-06f5-4179-ae13-705d510d0caf.png" 
              alt="WISDM CRM Logo" 
              className="h-8 w-auto"
            />
            {open && (
              <div>
                <p className="text-xs text-muted-foreground">Sales and Support Management</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tasks</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {taskItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Maintenance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {maintenanceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {open && (
          <div className="px-4 py-4 mt-auto">
            <QuickAddDialog>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
            </QuickAddDialog>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  )
}