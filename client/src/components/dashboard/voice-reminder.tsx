import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReminderSchema } from "@shared/schema";
import type { MedicationReminder, Medication } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Bell, Volume2 } from "lucide-react";

const DAYS_OF_WEEK = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "7", label: "Sunday" },
];

export default function VoiceReminder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports speech synthesis
    setSpeechSupported('speechSynthesis' in window);
  }, []);

  const form = useForm({
    resolver: zodResolver(insertReminderSchema),
    defaultValues: {
      userId: user?.id || 0,
      medicationId: 0,
      reminderTime: "",
      daysOfWeek: "",
      message: "",
      isActive: true
    }
  });

  const { data: medications } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const { data: reminders } = useQuery<MedicationReminder[]>({
    queryKey: ["/api/reminders"],
  });

  const createReminderMutation = useMutation({
    mutationFn: async (data: MedicationReminder) => {
      const res = await apiRequest("POST", "/api/reminders", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      form.reset();
      toast({
        title: "Reminder created",
        description: "Your medication reminder has been set successfully",
      });
    },
  });

  const testVoice = (message: string) => {
    if (!speechSupported) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice synthesis",
        variant: "destructive",
      });
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Set Medication Reminder</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createReminderMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="medicationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select medication" />
                      </SelectTrigger>
                      <SelectContent>
                        {medications?.map((med) => (
                          <SelectItem key={med.id} value={med.id.toString()}>
                            {med.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reminderTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="daysOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select days" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Message</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} placeholder="Time to take your medication" />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => testVoice(field.value)}
                        disabled={!speechSupported}
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={createReminderMutation.isPending}>
                <Bell className="mr-2 h-4 w-4" />
                Set Reminder
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reminders?.filter(r => r.isActive).map((reminder) => {
              const medication = medications?.find(m => m.id === reminder.medicationId);
              const days = reminder.daysOfWeek.split(",").map(d => 
                DAYS_OF_WEEK.find(day => day.value === d)?.label
              ).join(", ");

              return (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between border p-4 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{medication?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {reminder.reminderTime} on {days}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Message: {reminder.message}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => testVoice(reminder.message)}
                    disabled={!speechSupported}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
