# Section 1: Web Application (client folder)

## Setup Instructions

Before copying the code, ensure you have the following prerequisites:
```bash
# Required dependencies
npm install @tanstack/react-query @hookform/resolvers/zod drizzle-orm express react-hook-form shadcn-ui lucide-react zod wouter @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast recharts
```

## Core Components

### 1. App Entry Point (App.tsx)
```typescript
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Switch, Route } from "wouter";
import { AuthProvider } from "./hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import DashboardPage from "./pages/dashboard";
import AdminPage from "./pages/admin";
import AuthPage from "./pages/auth-page";
import NotFound from "./pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
```

### 2. Dashboard Page (pages/dashboard.tsx)
```typescript
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
```

### 3. Insurance Claims Component (components/dashboard/insurance-claims.tsx)
```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClaimSchema } from "@shared/schema";
import type { InsuranceClaim, InsuranceProvider } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Full component implementation as shown earlier in the file viewer
```

### 4. Voice Reminder Component (components/dashboard/voice-reminder.tsx)
```typescript
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReminderSchema } from "@shared/schema";
import type { MedicationReminder, Medication } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Bell, Volume2, VolumeX } from "lucide-react";

// ... [Rest of the voice-reminder.tsx code was shown earlier]
```

Would you like me to continue with the UI components, or would you prefer to see the Mobile App section next?