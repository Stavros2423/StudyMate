
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogIn, BookOpen } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { logIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      await logIn(email, password);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to log in. Please check your email and password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add animation when component mounts
  useEffect(() => {
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
      setTimeout(() => {
        loginCard.classList.add('animate-scale-in');
        loginCard.classList.remove('opacity-0');
      }, 100);
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 bg-gradient-to-b from-background to-background/80">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <Card className="w-full max-w-md login-card opacity-0 border shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back to StudyMate</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="transition-all duration-300 focus:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="transition-all duration-300 focus:border-primary"
                required
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full button-hover bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-700" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">◌</span> Logging in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" /> Log in
                </span>
              )}
            </Button>
            <p className="text-center text-sm">
              Don't have an account yet?{" "}
              <Link to="/signup" className="text-primary underline hover:text-purple-500 transition-colors">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
