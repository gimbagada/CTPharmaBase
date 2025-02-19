import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import type { InsuranceClaim, Medication, Inventory } from "@shared/schema";

export default function Analytics() {
  const { data: claims } = useQuery<InsuranceClaim[]>({
    queryKey: ["/api/claims"],
  });

  const { data: medications } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const { data: inventory } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  // Calculate statistics
  const totalClaims = claims?.length || 0;
  const pendingClaims = claims?.filter(c => c.status === "pending").length || 0;
  const verifiedMeds = medications?.filter(m => m.verifiedAt).length || 0;
  const totalInventory = inventory?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  // Prepare chart data
  const claimsByStatus = [
    { name: "Pending", value: pendingClaims },
    { name: "Approved", value: claims?.filter(c => c.status === "approved").length || 0 },
    { name: "Rejected", value: claims?.filter(c => c.status === "rejected").length || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClaims}</div>
            <p className="text-xs text-muted-foreground">
              {pendingClaims} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedMeds}</div>
            <p className="text-xs text-muted-foreground">
              of {medications?.length || 0} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInventory}</div>
            <p className="text-xs text-muted-foreground">
              units in stock
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Claims by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={claimsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={medications}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="verifiedAt" stroke="hsl(var(--primary))" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
