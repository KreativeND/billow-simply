
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileSearch } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        <div className="flex justify-center">
          <div className="bg-secondary/50 p-6 rounded-full">
            <FileSearch className="h-14 w-14 text-primary/70" />
          </div>
        </div>
        
        <h1 className="text-4xl font-medium text-foreground tracking-tight">404</h1>
        <p className="text-xl text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
        
        <Button asChild className="px-8">
          <a href="/">Return to Home</a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
