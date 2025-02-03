import { Link } from "react-router-dom";
import { Home, User, MessageSquare } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 hover:text-primary">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link to="/signup" className="flex items-center space-x-2 hover:text-primary">
              <User className="w-5 h-5" />
              <span>Sign up</span>
            </Link>
            <Link to="/chat" className="flex items-center space-x-2 hover:text-primary">
              <MessageSquare className="w-5 h-5" />
              <span>Chat with AI</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};