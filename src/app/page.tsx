
"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AppTitle from "@/components/AppTitle";
import { RAYDIUM_LIQUIDITY_POOL_URL } from "@/lib/constants";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CryptoValidatorPage() {
  const [isClient, setIsClient] = useState(false);
  const [tokenCA, setTokenCA] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [isProcessingValidation, setIsProcessingValidation] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getErrorMessageString = (err: any): string => {
    if (err && typeof err.message === 'string') {
      return err.message;
    }
    if (typeof err === 'string') {
      return err;
    }
    if (err && typeof err.toString === 'function') {
      const errStr = err.toString();
      if (errStr !== '[object Object]') {
        return errStr;
      }
    }
    return 'An unknown error occurred.';
  };

  const handlePayment = async (event: FormEvent) => {
    event.preventDefault();
    console.log("handlePayment called (simulated).");

    if (!tokenCA.trim()) {
      console.warn("handlePayment: Aborted - Token CA is empty.");
      setError("Please enter a valid Token Contract Address (CA).");
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenCA.trim())) {
      console.warn("handlePayment: Aborted - Invalid Token CA format:", tokenCA.trim());
      setError("Invalid Token Contract Address format. It should be a 40-character hex string starting with 0x.");
      return;
    }
    console.log("handlePayment: Token CA is valid:", tokenCA.trim());

    setIsLoading(true);
    setError(null);
    console.log("handlePayment: Proceeding with simulated validation...");

    try {
      // Simulate validation and processing
      setIsProcessingValidation(true);
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing delay
      setIsProcessingValidation(false);

      console.log("handlePayment: Simulated validation successful.");
      setShowSuccessDialog(true);
    } catch (err: any) {
      // This catch block is less likely to be hit now without real transactions,
      // but kept for robustness if other errors occur during simulation logic.
      const errorMessageString = getErrorMessageString(err);
      setError(`Simulated process failed: ${errorMessageString}`);
      console.error("Simulated process error:", err);
    } finally {
      setIsLoading(false);
      setIsProcessingValidation(false);
    }
  };

  const handleProceedToRaydium = () => {
    window.open(RAYDIUM_LIQUIDITY_POOL_URL, "_blank", "noopener,noreferrer");
    setShowSuccessDialog(false);
    setTokenCA(""); // Clear token CA
    setError(null); // Clear any errors
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-background font-body">
      <AppTitle />
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">Validate Your Token</CardTitle>
          <CardDescription className="text-center">
            Submit your token CA to simulate validation and proceed to create its market ID.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handlePayment} className="space-y-6">
            <div>
              <label htmlFor="tokenCA" className="block text-sm font-medium text-foreground mb-1">
                Token Contract Address (CA)
              </label>
              <Input
                id="tokenCA"
                type="text"
                value={tokenCA}
                onChange={(e) => setTokenCA(e.target.value)}
                placeholder="0x..."
                disabled={isLoading || isProcessingValidation}
                required
                className="bg-input border-border focus:ring-primary focus:border-primary"
              />
            </div>

            <Button type="submit" disabled={isLoading || isProcessingValidation} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading || isProcessingValidation ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-5 w-5" />
              )}
              {isProcessingValidation ? "Processing Validation..." : "Validate & Proceed"}
            </Button>
          </form>
        </CardContent>
        {error && (
          <CardFooter>
            <Alert variant="destructive" className="w-full">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardFooter>
        )}
      </Card>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-accent font-headline text-2xl">Success!</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Your token data has been notionally validated successfully (simulation).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleProceedToRaydium} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Proceed to Liquidity Pool
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CryptoValidator. All rights reserved.</p>
        <p className="mt-1">This is a conceptual demonstration of the validation process.</p>
      </footer>
    </main>
  );
}
