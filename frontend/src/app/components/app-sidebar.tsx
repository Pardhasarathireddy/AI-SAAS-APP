import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  Sparkles,
  MessageSquare,
  Clock,
  LogOut,
} from "lucide-react";
import { cn } from "./ui/utils";
import { useAuth } from "../../context/AuthContext";

const mainMenuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
];

const modelMap: Record<string, string> = {
  "/code-reviewer": "code-reviewer",
  "/script-generator": "script-generator",
  "/grammar-checker": "grammar-checker",
  "/data-analyst": "data-analyst",
  "/watermark-remover": "watermark-remover",
  "/resume-builder": "resume-builder",
  "/web-scraper": "web-scraper",
};

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/auth/history", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };

    fetchHistory();

    // Listen for custom events when a new tool history is generated
    const handleHistoryUpdate = () => {
      fetchHistory();
    };
    window.addEventListener("historyUpdated", handleHistoryUpdate);

    // Refresh history when location changes (in case a new tool was used)
    const interval = setInterval(fetchHistory, 30000); // Also poll every 30s
    return () => {
      clearInterval(interval);
      window.removeEventListener("historyUpdated", handleHistoryUpdate);
    };
  }, [user, location.pathname]);

  let currentModel = modelMap[location.pathname];
  if (!currentModel && location.pathname.startsWith('/history/')) {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments[1]) {
      currentModel = segments[1];
    }
  }
  const filteredHistory = history
    .filter(item => item.model === currentModel)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5); // Show last 5

  const formatTitle = (item: any) => {
    if (item.model === 'watermark-remover') return item.userInputs?.filename || "Processed Image";
    if (item.model === 'data-analyst') return item.userInputs?.filename || "Data Analysis";
    if (item.model === 'resume-builder') return item.userInputs?.jobDescription?.slice(0, 30) + "..." || "Resume Generator";
    if (item.model === 'code-reviewer') return item.userInputs?.repoUrl?.split('/').pop() || "Code Review";
    if (item.model === 'grammar-checker') return "Grammar Check Result";
    if (item.model === 'script-generator') return item.userInputs?.prompt?.slice(0, 30) + "..." || "Generated Script";
    if (item.model === 'web-scraper') return item.userInputs?.url || "Scraped Data";
    return "AI Interaction";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} mins ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col">
      {/* Logo */}
      <div className="px-6 h-16 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">AI SaaS App</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <div className="mb-6">
          <ul className="space-y-1">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Previous Chats Section */}
        {currentModel && (
          <div className="mt-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between px-3 mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Previous History</span>
              </div>
              <button
                onClick={() => navigate(`/history/${currentModel}`)}
                className="text-[10px] text-primary hover:underline font-medium"
              >
                View all
              </button>
            </div>
            <ul className="space-y-1">
              {filteredHistory.map((item, idx) => (
                <li key={item._id || idx}>
                  <button
                    onClick={() => navigate(`/history/${currentModel}/${item._id}`)}
                    className={cn(
                      "w-full flex flex-col items-start gap-1 px-3 py-3 rounded-lg transition-all text-left",
                      "hover:bg-accent/50 group"
                    )}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <MessageSquare className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium truncate flex-1">
                        {formatTitle(item)}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 pl-6">
                      {formatDate(item.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border">
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
            "hover:bg-accent hover:text-accent-foreground",
            location.pathname === "/settings"
              ? "bg-accent text-accent-foreground font-medium"
              : "text-muted-foreground"
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span>Settings</span>
        </Link>
        <button
          onClick={logout}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all mt-1",
            "hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
