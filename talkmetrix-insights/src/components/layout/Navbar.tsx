import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Bell, Activity, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const navLinks = [
  { to: "/", label: "Dashboard" },
  { to: "/upload", label: "Upload" },
  { to: "/conversations", label: "Conversations" },
  { to: "/analytics", label: "Analytics" },
  { to: "/reports", label: "Reports" },
];

const Navbar = () => {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { toast } = useToast();

  const handleSearchClick = () => {
    toast({
      title: "Search",
      description: "Use the page filters to refine results.",
    });
  };

  const handleNotificationsClick = () => {
    toast({
      title: "Notifications",
      description: "Alerts are visible in the Dashboard recent alerts panel.",
    });
  };

  const handleMenuItemClick = (label: string) => {
    setShowUserMenu(false);
    toast({
      title: label,
      description: `${label} action is available.`,
    });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass-strong">
      <div className="flex items-center justify-between h-full px-6 max-w-[1600px] mx-auto">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Activity className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">
            Talk<span className="text-primary">Metrix</span>
          </span>
        </Link>

        {/* Center: Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSearchClick}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Search className="w-4.5 h-4.5" />
          </button>
          <button
            type="button"
            onClick={handleNotificationsClick}
            className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive animate-pulse-glow" />
          </button>
          <div className="relative ml-2">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                JD
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
            </button>
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-48 py-1.5 rounded-xl glass-strong shadow-elevated"
                >
                  {[
                    { icon: User, label: "Profile" },
                    { icon: Settings, label: "Settings" },
                    { icon: LogOut, label: "Sign out" },
                  ].map((item) => (
                    <button
                      type="button"
                      onClick={() => handleMenuItemClick(item.label)}
                      key={item.label}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 border-t border-border/50 bg-background overflow-x-auto">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
