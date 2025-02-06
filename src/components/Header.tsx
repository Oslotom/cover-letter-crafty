import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/ModeToggle";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Cover Letter Generator
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/applications"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Applications
            </Link>
            <Link
              to="/my-resume"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              My Resume
            </Link>
            <Link
              to="/chat"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Chat
            </Link>
            <Link
              to="/contact"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};