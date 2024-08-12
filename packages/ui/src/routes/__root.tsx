import Topbar from "@/components/layout/topbar";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div>
      <Topbar />
      <main className="py-8 px-4">
        <Outlet />
      </main>
      {/* <TanStackRouterDevtools /> */}
    </div>
  ),
});
