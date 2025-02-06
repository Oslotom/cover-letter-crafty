import { Link } from "react-router-dom";
import { ModeToggle } from "./ModeToggle";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 items-center">
        <div className="flex items-center space-x-4 lg:space-x-6">
          <Link
            to="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            to="/my-resume"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            My Resume
          </Link>
          <Link
            to="/chat"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Chat
          </Link>
          <Link
            to="/prompt"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Prompt
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Contact
          </Link>
          <Link
            to="/roadmap"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Roadmap
          </Link>
        </div>
        <div className="ml-auto">
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
}