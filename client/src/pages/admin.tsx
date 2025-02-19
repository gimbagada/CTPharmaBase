import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Analytics from "@/components/admin/analytics";
import { useLocation } from "wouter";

export default function AdminPage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect non-admin users
  if (user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">CTPharmaLink NG - Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span>Admin: {user?.username}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">User Management</h2>
              {/* User management implementation */}
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Reports</h2>
              {/* Reports implementation */}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
