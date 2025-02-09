import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Cover Letter Generator
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                Dashboard
              </Link>
            )}
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
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
              >
                Logout
              </Button>
            )}
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};