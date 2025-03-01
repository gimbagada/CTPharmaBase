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
  const [volume, setVolume] = useState(0.8);
  const [speaking, setSpeaking] = useState(false);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize speech synthesis
    const initSpeech = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const synthesis = window.speechSynthesis;
        setSynth(synthesis);
        setSpeechSupported(true);

        // Test voice availability
        const voices = synthesis.getVoices();
        if (voices.length === 0) {
          synthesis.addEventListener('voiceschanged', () => {
            const updatedVoices = synthesis.getVoices();
            if (updatedVoices.length === 0) {
              setSpeechSupported(false);
              toast({
                title: "Voice Support Limited",
                description: "No voice synthesis voices available. Voice playback may not work.",
                variant: "destructive",
              });
            }
          });
        }
      } else {
        setSpeechSupported(false);
        toast({
          title: "Voice Support Unavailable",
          description: "Your browser doesn't support voice synthesis. Please use a modern browser.",
          variant: "destructive",
        });
      }
    };

    initSpeech();

    // Cleanup function
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
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
    if (!speechSupported || !synth || speaking) return;

    try {
      setSpeaking(true);

      // Cancel any ongoing speech
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.volume = volume;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select a good voice if available
      const voices = synth.getVoices();
      const englishVoice = voices.find(voice => voice.lang.startsWith('en-'));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => {
        setSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setSpeaking(false);
        toast({
          title: "Voice playback failed",
          description: "Failed to play the reminder message. Please try again.",
          variant: "destructive",
        });
      };

      synth.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setSpeaking(false);
      toast({
        title: "Voice playback failed",
        description: "An error occurred while trying to play the message.",
        variant: "destructive",
      });
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    // Test new volume with a short message
    testVoice("Testing volume level");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Set Medication Reminder</span>
            {!speechSupported && (
              <div className="flex items-center text-destructive text-sm">
                <VolumeX className="h-4 w-4 mr-2" />
                Voice not supported
              </div>
            )}
          </CardTitle>
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
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <FormControl>
                          <Input {...field} placeholder="Time to take your medication" />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => testVoice(field.value)}
                          disabled={!speechSupported || speaking}
                        >
                          <Volume2 className={`h-4 w-4 ${speaking ? 'animate-pulse' : ''}`} />
                        </Button>
                      </div>
                      {speechSupported && (
                        <div className="flex items-center gap-4 border rounded-md p-4">
                          <Volume2 className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <Slider
                              value={[volume]}
                              max={1}
                              step={0.1}
                              onValueCommit={handleVolumeChange}
                              className="w-full"
                            />
                          </div>
                          <span className="text-sm text-muted-foreground min-w-[3ch]">
                            {Math.round(volume * 100)}%
                          </span>
                        </div>
                      )}
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
                    disabled={!speechSupported || speaking}
                  >
                    <Volume2 className={`h-4 w-4 ${speaking ? 'animate-pulse' : ''}`} />
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