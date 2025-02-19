import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Medication } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function MedicationVerification() {
  const [batchId, setBatchId] = useState("");
  const { toast } = useToast();

  const { data: medications } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const verifyMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", "/api/medications/verify", { id });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      toast({
        title: "Verification successful",
        description: "Medication authenticity confirmed on blockchain",
      });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Verify Medication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter batch ID"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
            />
            <Button 
              onClick={() => {
                const medication = medications?.find(m => m.batchId === batchId);
                if (medication) {
                  verifyMutation.mutate(medication.id);
                }
              }}
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {medications?.map((medication) => (
              <div
                key={medication.id}
                className="flex items-center justify-between border p-4 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{medication.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Batch: {medication.batchId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Manufacturer: {medication.manufacturer}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {medication.verifiedAt ? (
                    <>
                      <CheckCircle className="text-green-500" />
                      <span className="text-sm text-green-500">Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-500" />
                      <span className="text-sm text-red-500">Unverified</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
