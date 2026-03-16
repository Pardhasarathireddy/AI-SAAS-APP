import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/code-reviewer": "Code Reviewer",
  "/script-generator": "Script Generator",
  "/grammar-checker": "Grammar Checker",
  "/data-analyst": "AI Data Analyst",
  "/watermark-remover": "Watermark Remover",
  "/resume-builder": "AI Resume Builder",
  "/web-scraper": "AI Web Scraper",
  "/settings": "Settings",
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathname = location.pathname;

  // Hide breadcrumbs on settings page
  if (pathname === "/settings") {
    return null;
  }

  // Handle case for root/dashboard
  if (pathname === "/") {
    return (
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center gap-2">
              <Home className="w-3.5 h-3.5" />
              Dashboard
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "history" && segments[1]) {
    const model = segments[1];
    const id = segments[2];
    const modelLabel = routeLabels[`/${model}`] || model.replace(/-/g, " ");

    return (
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-2">
                <Home className="w-3.5 h-3.5" />
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/${model}`}>{modelLabel}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {id ? (
              <BreadcrumbLink asChild>
                <Link to={`/history/${model}`}>History</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>History</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {id && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{id}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const label = routeLabels[pathname] || pathname.split("/").pop()?.replace(/-/g, " ");

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-3.5 h-3.5" />
              Dashboard
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{label}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
