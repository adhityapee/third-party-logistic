import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/client")({
  component: ClientLayout,
})

function ClientLayout() {
  return <Outlet />
}
