import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInventorySchema } from "@shared/schema";
import type { Inventory, Medication } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function InventoryManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(insertInventorySchema),
    defaultValues: {
      pharmacyId: user?.id || 0,
      medicationId: 0,
      quantity: 0
    }
  });

  const { data: inventory } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: medications } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Inventory) => {
      const res = await apiRequest("POST", "/api/inventory", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      form.reset();
      toast({
        title: "Inventory updated",
        description: "Inventory has been updated successfully",
      });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Update Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="medicationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication</FormLabel>
                    <FormControl>
                      <select 
                        {...field} 
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                      >
                        <option value="">Select medication</option>
                        {medications?.map((med) => (
                          <option key={med.id} value={med.id}>
                            {med.name} (Batch: {med.batchId})
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Inventory
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventory?.map((item) => {
              const medication = medications?.find(m => m.id === item.medicationId);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between border p-4 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{medication?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Batch: {medication?.batchId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Manufacturer: {medication?.manufacturer}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-semibold">{item.quantity}</p>
                    <p className="text-sm text-muted-foreground">units</p>
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
