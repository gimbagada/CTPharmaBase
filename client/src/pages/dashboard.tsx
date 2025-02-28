import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MedicationVerification from "@/components/dashboard/medication-verification";
import InsuranceClaims from "@/components/dashboard/insurance-claims";
import Inventory from "@/components/dashboard/inventory";
import PharmacyFinder from "@/components/dashboard/pharmacy-finder";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import VoiceReminder from "@/components/dashboard/voice-reminder";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">CTPharmaLink NG</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}</span>
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
        <Tabs defaultValue="medications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="medications">Medication Verification</TabsTrigger>
            <TabsTrigger value="claims">Insurance Claims</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="finder">Find Pharmacy</TabsTrigger>
            <TabsTrigger value="reminders">Medication Reminders</TabsTrigger>
          </TabsList>

          <TabsContent value="medications">
            <MedicationVerification />
          </TabsContent>

          <TabsContent value="claims">
            <InsuranceClaims />
          </TabsContent>

          <TabsContent value="inventory">
            <Inventory />
          </TabsContent>

          <TabsContent value="finder">
            <PharmacyFinder />
          </TabsContent>
          <TabsContent value="reminders">
            <VoiceReminder />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}