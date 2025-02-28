import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (type: "LOGIN" | "SIGNUP") => {
    try {
      setLoading(true);
      const { error } =
        type === "LOGIN"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (error) throw error;
      
      if (!error) {
        navigate("/");
        toast({
          title: type === "LOGIN" ? "Logged in successfully" : "Signed up successfully",
          description: type === "SIGNUP" ? "Please check your email to verify your account" : undefined,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-lg mx-auto p-4">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Enter your email below to login or create your account
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => handleAuth("LOGIN")}
              disabled={loading}
            >
              Login
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAuth("SIGNUP")}
              disabled={loading}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}