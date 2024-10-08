import Topbar from '@/components/layout/topbar';
import { TestnetIndicator } from '@/components/testnet-indicator';
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen overflow-y-auto bg-[url('@/assets/background.svg')] bg-cover">
      <Topbar />
      <main className='py-8 px-4'>
        <Outlet />
      </main>
      <TestnetIndicator />
      {/* <TanStackRouterDevtools /> */}
    </div>
  ),
});
