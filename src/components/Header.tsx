import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Home, MessageSquare } from "lucide-react";
import { DarkModeToggle } from "./DarkModeToggle";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b border-border/40">
      <div className="container flex items-center justify-between h-16 px-4">
        <nav className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <Link to="/chat">
            <Button variant="ghost" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              AI Chat
            </Button>
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
};