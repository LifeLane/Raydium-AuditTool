
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppTitle from "@/components/AppTitle";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import DonationButtonEmbed from "@/components/DonationButtonEmbed"; // New component

export default function CryptoValidatorPage() {
  const [isClient, setIsClient] = useState(false);
  const [tokenCA, setTokenCA] = useState("");
  const [isSmartContractSubmitted, setIsSmartContractSubmitted] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmitSmartContract = () => {
    if (tokenCA.trim() === '') {
      alert("Please enter a Token Contract Address."); // Simple validation
      return;
    }
    setIsSmartContractSubmitted(true);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-background font-body">
      <AppTitle />
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">CryptoValidator Concept</CardTitle>
          <CardDescription className="text-center">
            Validate your token and create its market ID.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tokenCA">Token CA</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <p className="text-center text-muted-foreground">
                This application demonstrates the conceptual flow for a token validation service.
                Explore how to secure and validate your crypto tokens and set up their market identity.
              </p>
            </TabsContent>
            <TabsContent value="tokenCA" className="mt-4">
              <div className="space-y-4">
                {!isSmartContractSubmitted ? (
                  <>
                    <div>
                      <Label htmlFor="tokenCAInput" className="text-sm font-medium">Token Contract Address (CA)</Label>
                      <Input
                        id="tokenCAInput"
                        placeholder="Enter Token CA (e.g., 0x...)"
                        value={tokenCA}
                        onChange={(e) => setTokenCA(e.target.value)}
                        className="mt-1"
                      />
                       <p className="text-xs text-muted-foreground mt-1">
                        Enter the contract address of the token you wish to validate.
                      </p>
                    </div>
                    <Button 
                      onClick={handleSubmitSmartContract}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      Submit Smart Contract & Proceed
                    </Button>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">Your Token CA submission is being processed. Please proceed with the payment below.</p>
                    <DonationButtonEmbed />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CryptoValidator. All rights reserved.</p>
        <p className="mt-1">Conceptual demonstration of token validation and market ID setup.</p>
      </footer>
    </main>
  );
}
