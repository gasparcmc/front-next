"use client"

import { Calendar, Home, Receipt, Search, Settings, User, Shield, Bell } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { apiClient } from "@/lib/apiClient"
import { useEffect, useState } from "react"

interface MenuItem {
  title: string;
  url: string;
  icon: string;
  hasSubmenu?: boolean;
  subItems?: MenuItem[];
}




export function AppSidebar() {

  const [items, setItems] = useState<MenuItem[]>([]);
  useEffect(() => {
    fetchItems();
  }, []);


  const iconMap = {
    Home: Home,
    User: User,
    Settings: Settings,
    Search: Search,
    Calendar: Calendar,
    Receipt: Receipt,
    Shield: Shield,
    Bell: Bell,
  } as const;

  function getIcon(iconName: string) {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Home;
    return <IconComponent/>;
  }

  const fetchItems = async () => {
    const data = await apiClient<MenuItem[]>('user/menu');
    setItems(data);
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.hasSubmenu ? (
                    // Item con submenú usando Accordion
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem 
                        value={item.title} 
                        className="border-none [&[data-state=open]]:bg-sidebar-accent"
                      >
                        <AccordionTrigger className="hover:no-underline [&[data-state=open]>svg]:rotate-180 flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0">
                          {getIcon(item.icon)}
                          <span>{item.title}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pt-0">
                          <SidebarMenu>
                            {item.subItems?.map((subItem) => (
                              <SidebarMenuItem key={subItem.title}>
                                <SidebarMenuButton asChild>
                                  <a href={subItem.url}>
                                    {getIcon(subItem.icon)}
                                    <span>{subItem.title}</span>
                                  </a>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    // Item normal sin submenú
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        {getIcon(item.icon)}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}