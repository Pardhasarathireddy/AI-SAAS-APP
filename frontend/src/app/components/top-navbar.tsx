import { Search, Moon, Sun, Menu, LogOut, Settings, Command } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useTheme } from "./theme-provider";
import { useAuth } from "../../context/AuthContext";
import { tools } from "../lib/tools";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function TopNavbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTools, setFilteredTools] = useState<typeof tools>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTools([]);
      return;
    }

    const filtered = tools.filter(tool =>
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTools(filtered);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToolSelect = (path: string) => {
    navigate(path);
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  return (
    <header className="h-16 border-b border-border bg-card px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-50">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="w-5 h-5" />
      </Button>

      {/* Search Bar */}
      <div className="flex-1 max-w-xl relative" ref={searchRef}>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Search tools... (e.g. Code, Resume)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="pl-9 bg-accent/30 border-border/50 focus:bg-accent/50 transition-all rounded-xl"
          />
        </div>

        {/* Search Results Dropdown */}
        {isSearchFocused && searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {filteredTools.length > 0 ? (
              <div className="p-2">
                <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Tools Found
                </p>
                {filteredTools.map((tool) => (
                  <button
                    key={tool.path}
                    onClick={() => handleToolSelect(tool.path)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors group text-left"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.gradient}`}>
                      <tool.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none mb-1 group-hover:text-primary transition-colors">
                        {tool.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {tool.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                  <Command className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No tools found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching for something else
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-9 h-9 cursor-pointer border-2 border-border transition-transform active:scale-95">
              <AvatarImage src="https://github.com/shadcn.png" alt="User" />
              <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex w-full items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
