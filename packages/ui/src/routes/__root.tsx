import Topbar from "@/components/layout/topbar";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div>
      <Topbar />
      <main className="py-10 px-4">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  ),
});
