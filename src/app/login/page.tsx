
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { useAuth, useUser } from "@/firebase/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Phone, LogIn } from "lucide-react";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();

  if(user) {
    router.push('/');
  }

  const setupRecaptcha = () => {
    if (!auth) return;
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response: any) => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            console.log("reCAPTCHA solved");
          },
        }
      );
    }
  };

  const handleSendCode = async () => {
    if (!auth) {
        toast({
            title: "Error",
            description: "Authentication service not available.",
            variant: "destructive",
        });
        return;
    }
    setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    if (!appVerifier) {
        toast({
            title: "Error",
            description: "reCAPTCHA verifier not initialized.",
            variant: "destructive",
        });
        return;
    }

    try {
      setIsSubmitting(true);
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );
      window.confirmationResult = confirmationResult;
      setStep("code");
      toast({
        title: "Verification Code Sent",
        description: `A code has been sent to ${phoneNumber}.`,
      });
    } catch (error: any) {
      console.error("SMS not sent", error);
      toast({
        title: "Error Sending Code",
        description: error.message || "Could not send verification code.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    const confirmationResult = window.confirmationResult;
    if (!confirmationResult) {
        toast({
            title: "Error",
            description: "No confirmation result found. Please try sending the code again.",
            variant: "destructive",
        });
        return;
    }
    try {
        setIsSubmitting(true);
      await confirmationResult.confirm(verificationCode);
      toast({
        title: "Login Successful!",
        description: "You have been successfully logged in.",
      });
      router.push("/");
    } catch (error: any) {
      console.error("Verification failed", error);
      toast({
        title: "Verification Failed",
        description: error.message || "The verification code is incorrect.",
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <div id="recaptcha-container"></div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">
            Welcome Back!
          </CardTitle>
          <CardDescription>
            {step === 'phone' ? 'Enter your phone number to sign in.' : 'Enter the verification code.'}
          </CardDescription>
        </CardHeader>

        {step === 'phone' ? (
             <form onSubmit={(e) => { e.preventDefault(); handleSendCode(); }}>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="tel"
                            placeholder="+6281234567890"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="pl-10"
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        <LogIn className="mr-2 h-5 w-5" />
                        {isSubmitting ? "Sending Code..." : "Send Verification Code"}
                    </Button>
                </CardFooter>
            </form>
        ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleVerifyCode(); }}>
                <CardContent className="space-y-4">
                     <Input
                        type="text"
                        placeholder="123456"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        required
                    />
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Verifying..." : "Verify and Sign In"}
                    </Button>
                    <Button variant="link" onClick={() => setStep('phone')}>
                        Back to phone number entry
                    </Button>
                </CardFooter>
            </form>
        )}
      </Card>
    </div>
  );
}