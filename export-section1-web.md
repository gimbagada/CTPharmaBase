# Section 1: Web Application (/client)

## Directory Structure
```
/client
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── insurance-claims.tsx
│   │   │   ├── medication-verification.tsx
│   │   │   ├── pharmacy-finder.tsx
│   │   │   └── voice-reminder.tsx
│   │   └── ui/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── ... (other UI components)
│   ├── pages/
│   │   ├── dashboard.tsx
│   │   ├── auth-page.tsx
│   │   └── not-found.tsx
│   ├── lib/
│   │   └── queryClient.ts
│   └── App.tsx
└── index.html
```

## Core Files

### 1. /client/src/App.tsx
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

### 2. /client/src/pages/dashboard.tsx
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

### 3. /client/src/components/dashboard/insurance-claims.tsx
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

export default function InsuranceClaims() {
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertClaimSchema),
    defaultValues: {
      pharmacyId: user?.id || 0,
      medicationId: 0,
      providerId: 0,
      patientName: "",
      policyNumber: "",
      claimAmount: 0,
      status: "pending" as const
    }
  });

  const { data: claims } = useQuery<InsuranceClaim[]>({
    queryKey: ["/api/claims"],
  });

  const { data: providers } = useQuery<InsuranceProvider[]>({
    queryKey: ["/api/providers/active"],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsuranceClaim) => {
      const res = await apiRequest("POST", "/api/claims", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/claims"] });
      form.reset();
      toast({
        title: "Claim submitted",
        description: "Insurance claim has been submitted successfully",
      });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Submit New Claim</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => submitMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="providerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Provider</FormLabel>
                    <FormControl>
                      <select 
                        {...field} 
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="">Select provider</option>
                        {providers?.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="policyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="claimAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Claim Amount</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={submitMutation.isPending}>
                {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Claim
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {claims?.map((claim) => {
              const provider = providers?.find(p => p.id === claim.providerId);
              return (
                <div
                  key={claim.id}
                  className="flex items-center justify-between border p-4 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{claim.patientName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Provider: {provider?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Amount: ₦{claim.claimAmount}
                    </p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      claim.status === "approved" ? "bg-green-100 text-green-800" :
                      claim.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 4. /client/src/components/dashboard/voice-reminder.tsx
[Content of the updated voice reminder component with volume control and error handling]

## Setup Instructions

1. Install Dependencies:
```bash
npm install @tanstack/react-query @hookform/resolvers/zod drizzle-orm express react-hook-form shadcn-ui lucide-react zod wouter @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-toast recharts
```

2. Environment Variables:
```env
VITE_API_URL=http://localhost:5000
```

Would you like me to continue with Section 2 (Mobile App) or Section 3 (Backend Server)?
