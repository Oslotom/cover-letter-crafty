
import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  const Logo = () => (
    <img 
      src="/logo.png" 
      alt="Cover Letter Generator" 
      className="h-8 w-auto"
    />
  );

  const DesktopNav = () => (
    <>
      <div className="mr-4 hidden md:flex">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <Logo />
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
    </>
  );

  const MobileNav = () => (
    <>
      <div className="flex items-center flex-1">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-4">
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="text-lg font-medium"
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/contact"
              className="text-lg font-medium"
            >
              Contact
            </Link>
            {!isAuthenticated ? (
              <Link to="/auth">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
            ) : (
              <Button 
                variant="outline"
                className="w-full"
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
              >
                Logout
              </Button>
            )}
            <div className="flex justify-center mt-2">
              <ModeToggle />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {isMobile ? <MobileNav /> : <DesktopNav />}
      </div>
    </header>
  );
};
