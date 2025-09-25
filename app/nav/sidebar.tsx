import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Files, ChartBar } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import type { User } from '@core/user';
import { NavUser } from './navuser';

const MENUS = [
  {
    label: 'Dashboard',
    link: '/',
    icon: ChartBar,
  },
  {
    label: 'Land valuation requests',
    link: '/land-valuation-requests',
    icon: Files,
  },
];
export type AppSidebarProps = {
  user: User;
};
export function AppSidebar({ user }: AppSidebarProps) {
  const sidebar = useSidebar();
  const location = useLocation();

  function isActive(link: string) {
    const path = location.pathname;

    if (link === '/') {
      return path === '/';
    } else {
      return path?.startsWith(link);
    }
  }

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <div className=" flex gap-4 items-center justify-center">
          <div
            data-open={sidebar.open}
            className="h-8 w-8 data-[open=true]:hidden p-1"
          />
          <div
            data-open={sidebar.open}
            className="h-20 w-44 data-[open=false]:hidden p-2"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {MENUS.filter((item) => item.icon !== undefined).map((item) => (
              <SidebarMenuItem key={item.link}>
                <SidebarMenuButton asChild isActive={isActive(item.link)}>
                  <Link to={item.link}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <NavUser user={user} />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
