import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout transparente — herda o shell do admin (route.tsx pai)
export const Route = createFileRoute("/_authenticated/admin/cotacoes")({
  component: () => <Outlet />,
});
