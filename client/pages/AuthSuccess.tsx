import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleGoogleAuthSuccess = async () => {
      const token = searchParams.get("token");
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      
      // Debug logging
      console.log("AuthSuccess component - Current URL:", window.location.href);
      console.log("AuthSuccess component - Search params:", Array.from(searchParams.entries()));
      console.log("AuthSuccess component - Token found:", token);
      console.log("AuthSuccess component - Code found:", code);
      console.log("AuthSuccess component - Error found:", error);

      if (error) {
        let errorMessage = "Google authentication failed";
        
        switch (error) {
          case "google_auth_failed":
            errorMessage = "Google authentication failed. Please try again.";
            break;
          case "google_auth_cancelled":
            errorMessage = "Google authentication was cancelled.";
            break;
          case "token_generation_failed":
            errorMessage = "Failed to generate authentication token.";
            break;
          default:
            errorMessage = "An unknown error occurred during authentication.";
        }

        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive",
        });

        navigate("/auth");
        return;
      }

      try {
        // If we have a temporary code, exchange it for the actual token
        if (code) {
          const exchangeResponse = await fetch(`http://localhost:8080/api/auth/google/exchange?code=${code}`);
          
          if (exchangeResponse.ok) {
            const exchangeData = await exchangeResponse.json();
            
            if (exchangeData.success && exchangeData.user && exchangeData.token) {
              login(exchangeData.token, exchangeData.user);

              toast({
                title: "Success!",
                description: `Successfully signed in as ${exchangeData.user.name}!`,
              });

              navigate("/dashboard");
              return;
            }
          } else {
            console.error("Token exchange failed:", exchangeResponse.status, exchangeResponse.statusText);
          }
        }
        
        // If we have a token in URL, use it directly (old method for backward compatibility)
        if (token) {
          const profileResponse = await fetch("http://localhost:8080/api/auth/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            
            if (profileData.success && profileData.user) {
              login(token, profileData.user);

              toast({
                title: "Success!",
                description: `Successfully signed in as ${profileData.user.name}!`,
              });

              navigate("/dashboard");
              return;
            }
          }
        }
        
        throw new Error("No valid authentication method provided");
      } catch (error) {
        console.error("Auth success error:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to complete authentication. Please try signing in again.",
          variant: "destructive",
        });
        navigate("/auth");
      } finally {
        setIsProcessing(false);
      }
    };

    handleGoogleAuthSuccess();
  }, [searchParams, navigate, login, toast]);

  if (!isProcessing) {
    return null; // This should redirect before showing anything
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
