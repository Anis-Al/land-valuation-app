import { Separator } from '@/components/ui/separator';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Outlet, useLoaderData } from 'react-router';
import { AppSidebar } from './sidebar';
import { ThemeToggle } from './theme';
import { getCurrentUser } from '@/auth';
import type { Route } from '../+types/root';

export async function loader({ request }: Route.LoaderArgs) {
  return {
    user: await getCurrentUser(request),
  };
}

type LoaderData = Awaited<ReturnType<typeof loader>>;

export default function Shell() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar user={user} />
      <main className="flex flex-col w-full h-screen overflow-y-scroll bg-background">
        <div className="grid grid-cols-3 p-4">
          <SidebarTrigger className="grow-0 cursor-pointer" />
          <div className="grow-1" />
          <div className="flex justify-end grow-0 items-center">
            <Separator orientation="vertical" className="mx-2 max-h-4" />
            <ThemeToggle />
          </div>
        </div>
        <div className="px-4 flex-1 pb-4">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
