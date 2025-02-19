import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClaimSchema } from "@shared/schema";
import type { InsuranceClaim } from "@shared/schema";
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
      patientName: "",
      insuranceProvider: "",
      claimAmount: 0,
      status: "pending"
    }
  });

  const { data: claims } = useQuery<InsuranceClaim[]>({
    queryKey: ["/api/claims"],
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
                name="insuranceProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Provider</FormLabel>
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
            {claims?.map((claim) => (
              <div
                key={claim.id}
                className="flex items-center justify-between border p-4 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{claim.patientName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Provider: {claim.insuranceProvider}
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
