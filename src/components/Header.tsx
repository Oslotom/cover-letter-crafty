
import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, Home, User, LayoutDashboard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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

  const MobileMenu = () => (
    <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} fixed inset-0 bg-background backdrop-blur-sm z-50`}>
      <div className="p-4 space-y-4 bg-background">
        <div className="flex justify-end items-center">
          <span className="font-bold">Menu</span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="space-y-4">
          <Link
            to="/"
            className="flex justify-end items-center space-x-2 p-2 hover:bg-accent rounded-lg"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="flex justify-end items-center space-x-2 p-2 hover:bg-accent rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          )}
          <Link
            to="/profile"
            className="flex justify-end items-center space-x-2 p-2 hover:bg-accent rounded-lg"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <User className="h-5 w-5" />
            <span>Profile</span>
          </Link>
        </nav>
        <div className="pt-4 justify-end flex items-center justify-end">
          <ModeToggle />
          {!isAuthenticated ? (
            <Link to="/auth">
              <Button variant="default" size="sm">
                Login
              </Button>
            </Link>
          ) : (
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
                setIsMobileMenuOpen(false);
              }}
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full justfify-end backdrop-blur-sm bg-background/70">
      <div className="container flex justify-end h-16 items-center">
        {isMobile ? (
          <>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-16 w-16 min-w-[32px] min-h-[32px] " />
            </Button>
            <MobileMenu />
          </>
        ) : (
          <nav className="flex flex-1 items-center space-x-6">
            <Link to="/" className="font-semibold">
              Cover Letter Generator
            </Link>
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/profile"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Profile
            </Link>
          </nav>
        )}
        <div className="flex items-center space-x-4">
          {!isMobile && (
            <>
              <ModeToggle />
              {!isAuthenticated ? (
                <Link to="/auth">
                  <Button variant="default" size="sm">
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
            </>
          )}
        </div>
      </div>
    </header>
  );
};
