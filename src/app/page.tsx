
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppTitle from "@/components/AppTitle";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function CryptoValidatorPage() {
  const [isClient, setIsClient] = useState(false);
  const [tokenCA, setTokenCA] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmitTokenCA = async () => {
    if (tokenCA.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Please enter a Token Contract Address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call to get payment URL
      // In a real scenario, this would involve your backend and Raydium
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      const paymentAPIResponse = {
        status: true,
        // Replace with actual payment URL generation logic if needed
        redirectTO: `https://raydium.io/liquidity/create/?ammId=${tokenCA}`, // Example redirect
        message: "Payment request initiated successfully."
      };
      
      if (paymentAPIResponse.status && paymentAPIResponse.redirectTO) {
        toast({
          title: "Processing Complete",
          description: "Redirecting to payment/liquidity pool setup...",
        });
        window.location.href = paymentAPIResponse.redirectTO;
      } else {
        throw new Error(paymentAPIResponse.message || 'Invalid response from payment server.');
      }
    } catch (error: any) {
      console.error('Payment Initiation Error:', error);
      toast({
        title: "Error",
        description: error.message || "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
          <CardTitle className="text-2xl font-headline text-center">CryptoValidator</CardTitle>
          <CardDescription className="text-center">
            Enter your token's Contract Address to validate and proceed with market ID creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tokenCA" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tokenCA">Submit Token CA</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <p className="text-sm text-center text-muted-foreground">
                This application helps you validate your crypto token and initiate the process for its market ID.
                Ensure your token CA is correct before proceeding. The next step involves a payment to deploy the necessary smart contracts.
              </p>
            </TabsContent>
            <TabsContent value="tokenCA" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tokenCAInput" className="text-sm font-medium">Token Contract Address (CA)</Label>
                  <Input
                    id="tokenCAInput"
                    placeholder="Enter Token CA (e.g., SOL address)"
                    value={tokenCA}
                    onChange={(e) => setTokenCA(e.target.value)}
                    className="mt-1"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the Solana contract address of the token you wish to validate.
                  </p>
                </div>
                <Button
                  onClick={handleSubmitTokenCA}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Submit CA & Proceed to Payment"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CryptoValidator. All rights reserved.</p>
        <p className="mt-1">Secure token validation and market ID setup.</p>
        <p className="mt-1 font-semibold">
          Powered by <a href="https://raydium.io/" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Raydium</a>
        </p>
      </footer>
    </main>
  );
}
