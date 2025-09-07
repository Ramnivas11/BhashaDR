"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getSuggestionsAction } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Hospital, AlertTriangle, LocateIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { value: "english", label: "English" },
  { value: "hindi", label: "हिंदी (Hindi)" },
  { value: "tamil", label: "தமிழ் (Tamil)" },
  { value: "telugu", label: "తెలుగు (Telugu)" },
  { value: "gujarati", label: "ગુજરાતી (Gujarati)" },
  { value: "bengali", label: "বাংলা (Bengali)" },
  { value: "marathi", label: "मराठी (Marathi)" },
];

const hospitals = [
    { name: "City Hospital", distance: "2.3 km", address: "123 Health St, Downtown" },
    { name: "Apollo Clinic", distance: "1.5 km", address: "456 Wellness Ave, Uptown" },
    { name: "Community Medical Center", distance: "5.1 km", address: "789 Care Rd, Suburbia" },
];

const symptomSchema = z.object({
  symptoms: z.string().min(10, { message: "Please describe your symptoms in at least 10 characters." }),
  language: z.string({ required_error: "Please select a language." }),
});

type SymptomFormValues = z.infer<typeof symptomSchema>;

export function SymptomChecker() {
  const [result, setResult] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(symptomSchema),
    defaultValues: {
      language: "english",
      symptoms: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: SymptomFormValues) => {
    setResult(null);
    const response = await getSuggestionsAction(data);
    if (response.error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: response.error,
      });
    } else if (response.suggestions) {
      setResult(response.suggestions);
    }
  };
  
  const handleLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd use these coordinates to fetch nearby hospitals from an API.
          // For now, we'll just show the hardcoded list.
          console.log("Latitude:", position.coords.latitude, "Longitude:", position.coords.longitude);
          toast({
            title: "Location found!",
            description: "Displaying nearby hospitals.",
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Could not get your location. Please check your browser permissions.",
          });
          setLocationLoading(false);
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Location Not Supported",
        description: "Your browser does not support geolocation.",
      });
      setLocationLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-primary font-headline text-2xl">Describe Your Symptoms</CardTitle>
          <CardDescription>Select your language and tell us how you're feeling.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symptoms</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'I have a fever and a sore throat for 2 days' or 'मुझे 2 दिन से बुखार और गले में दर्द है।'"
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full !mt-8 bg-accent hover:bg-accent/80 text-accent-foreground" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Get Suggestions"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="shadow-lg animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="text-primary font-headline text-2xl">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Possible Conditions</h3>
              <div className="p-4 bg-card rounded-lg border">
                <p className="text-foreground whitespace-pre-wrap">{result}</p>
              </div>
            </div>
            
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="font-bold">Disclaimer</AlertTitle>
                <AlertDescription>
                    This is not medical advice. Please consult a doctor for confirmation.
                </AlertDescription>
            </Alert>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Nearby Hospitals</h3>
                <Button variant="outline" onClick={handleLocation} disabled={locationLoading}>
                  {locationLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LocateIcon className="mr-2 h-4 w-4" />
                  )}
                  Use My Location
                </Button>
              </div>
              <div className="space-y-4">
                {hospitals.map((hospital, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border bg-card">
                    <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                        <Hospital className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold">{hospital.name}</h4>
                      <p className="text-sm text-muted-foreground">{hospital.address}</p>
                      <Badge variant="secondary" className="mt-2">{hospital.distance}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
