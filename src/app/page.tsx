
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppTitle from "@/components/AppTitle";
import { Loader2 } from "lucide-react";

export default function CryptoValidatorPage() {
  const [isClient, setIsClient] = useState(false);

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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-background font-body">
      <AppTitle />
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">CryptoValidator Concept</CardTitle>
          <CardDescription className="text-center">
            Welcome to the CryptoValidator concept page. This application demonstrates the initial idea for a token validation service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            This is a placeholder for the future application interface.
            Explore the concept of securing and validating your crypto tokens.
          </p>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CryptoValidator. All rights reserved.</p>
        <p className="mt-1">Conceptual demonstration of token validation and market ID setup.</p>
      </footer>
    </main>
  );
}
