import { Outlet } from "react-router-dom";
import { AppSidebar } from "./app-sidebar";
import { TopNavbar } from "./top-navbar";
import { Breadcrumbs } from "./breadcrumbs";

export function MainLayout() {
  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
