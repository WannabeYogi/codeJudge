"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { apiService } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function UserRegistration() {
  const [username, setUsername] = useState("");
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();

  // Load user from localStorage on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedUserId = localStorage.getItem("userId");
    
    if (storedUsername && storedUserId) {
      setCurrentUsername(storedUsername);
      setUserId(storedUserId);
    }
  }, []);

  const handleRegister = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRegistering(true);
      const user = await apiService.createUser(username);
      
      // Store user info in localStorage
      localStorage.setItem("username", user.username);
      localStorage.setItem("userId", user.id);
      
      setCurrentUsername(user.username);
      setUserId(user.id);
      
      toast({
        title: "Success",
        description: `Welcome, ${user.username}!`,
      });
      
      // Clear the input
      setUsername("");
    } catch (error) {
      console.error("Failed to register user:", error);
      toast({
        title: "Error",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
    setCurrentUsername(null);
    setUserId(null);
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <>
      <DialogTitle className="sr-only">
        {currentUsername ? "User Profile" : "Register"}
      </DialogTitle>
      <DialogDescription className="sr-only">
        {currentUsername 
          ? "You are currently registered as:"
          : "Register with a username to participate in contests"}
      </DialogDescription>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {currentUsername ? "User Profile" : "Register"}
          </CardTitle>
          <CardDescription>
            {currentUsername 
              ? "You are currently registered as:"
              : "Register with a username to participate in contests"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentUsername ? (
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="current-username">Username</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    id="current-username" 
                    value={currentUsername} 
                    disabled 
                    className="font-medium"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="user-id">User ID</Label>
                <Input 
                  id="user-id" 
                  value={userId || ""} 
                  disabled 
                  className="font-mono text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRegister();
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {currentUsername ? (
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full"
            >
              Logout
            </Button>
          ) : (
            <Button 
              onClick={handleRegister} 
              disabled={isRegistering || !username.trim()}
              className="w-full"
            >
              {isRegistering ? "Registering..." : "Register"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </>
  );
}