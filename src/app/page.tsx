
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MessageSquare, Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const phoneSchema = z.object({
  countryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number is too long"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

const formSchema = phoneSchema.merge(otpSchema.partial());

type Country = {
  name: {
    common: string;
  };
  idd: {
    root: string;
    suffixes: string[];
  };
  flags: {
    svg: string;
  }
};

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [countries, setCountries] = useState<Country[]>([]);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(step === "phone" ? phoneSchema : formSchema),
    defaultValues: {
      countryCode: "",
      phoneNumber: "",
      otp: "",
    },
  });

  useEffect(() => {
    setIsClient(true);
    if (localStorage.getItem("isAuthenticated")) {
      router.push("/chat");
    }
  }, [router]);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,idd,flags")
      .then((res) => res.json())
      .then((data: Country[]) => {
        const sortedCountries = data
          .filter(c => c.idd.root)
          .sort((a, b) => a.name.common.localeCompare(b.name.common));
        setCountries(sortedCountries);
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Could not fetch country codes. Please try again later.",
          variant: "destructive",
        });
      });
  }, [toast]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    if (step === "phone") {
      // Simulate sending OTP
      setTimeout(() => {
        toast({
          title: "OTP Sent",
          description: `An OTP has been sent to ${data.countryCode}${data.phoneNumber}`,
        });
        setStep("otp");
        setIsSubmitting(false);
      }, 1500);
    } else {
      // Simulate verifying OTP - any 6-digit number works
      setTimeout(() => {
        toast({
          title: "Success!",
          description: "You have been logged in successfully.",
        });
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userPhone", `${data.countryCode}${data.phoneNumber}`);
        router.push("/chat");
        setIsSubmitting(false);
      }, 1500);
    }
  };

  const selectedCountry = useMemo(() => {
      const countryCode = form.watch("countryCode");
      if (!countryCode) return null;
      return countries.find(c => `${c.idd.root}${c.idd.suffixes?.[0] || ''}` === countryCode);
  }, [countries, form.watch("countryCode")]);

  if (!isClient) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
       <header className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 md:p-6">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary animate-float" />
            <h1 className="animated-gradient-text text-2xl font-bold tracking-tight">Megumi</h1>
          </div>
          <ThemeToggle />
       </header>

      <Card className="w-full max-w-sm neumorphic-out animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-2xl">
            {step === 'phone' ? 'Login with Phone' : 'Verify OTP'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' ? 'Enter your phone number to receive an OTP.' : 'Enter the 6-digit OTP sent to your phone.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {step === "phone" ? (
                <>
                  <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={popoverOpen}
                                    className={cn(
                                    "w-full justify-between neumorphic-in",
                                    !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {selectedCountry ? selectedCountry.name.common : "Select country"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search country..." />
                                    <CommandList>
                                        <CommandEmpty>No country found.</CommandEmpty>
                                        <CommandGroup>
                                        {countries.map((country) => {
                                            const countryCodeValue = `${country.idd.root}${country.idd.suffixes?.[0] || ''}`;
                                            return (
                                                <CommandItem
                                                    value={country.name.common}
                                                    key={country.name.common}
                                                    onSelect={() => {
                                                        form.setValue("countryCode", countryCodeValue);
                                                        setPopoverOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        field.value === countryCodeValue ? "opacity-100" : "opacity-0"
                                                    )}
                                                    />
                                                    {country.name.common} ({countryCodeValue})
                                                </CommandItem>
                                            )
                                        })}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} className="neumorphic-in" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>OTP</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter 6-digit OTP" {...field} className="neumorphic-in" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit" className="w-full neumorphic-out bg-primary" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step === 'phone' ? 'Send OTP' : 'Verify OTP'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
