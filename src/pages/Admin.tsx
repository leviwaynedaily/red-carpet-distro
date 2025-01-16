import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductManagement } from "@/components/admin/ProductManagement";
import { SiteSettings } from "@/components/admin/SiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminPassword();
  }, []);

  const fetchAdminPassword = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("admin_password")
        .single();

      if (error) throw error;
      
      if (data?.admin_password) {
        setAdminPassword(data.admin_password);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching admin password:", error);
      toast.error("Failed to load admin settings");
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) {
      toast.error("Admin password not set. Please set it in Site Settings first.");
      return;
    }
    
    if (password === adminPassword) {
      setIsAuthenticated(true);
      toast.success("Welcome to admin dashboard");
    } else {
      toast.error("Invalid password");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Admin Login</h2>
            <p className="mt-2 text-gray-600">Enter password to access admin panel</p>
          </div>
          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full"
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
            Logout
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Site
          </Button>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products & Categories</TabsTrigger>
          <TabsTrigger value="settings">Site Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <ProductManagement />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SiteSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}