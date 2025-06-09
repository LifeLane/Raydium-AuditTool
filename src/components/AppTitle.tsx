
"use client";
import { ShieldCheck } from 'lucide-react';

const AppTitle = () => (
  <div className="flex flex-col items-center mb-8 text-center">
    <div className="flex items-center space-x-3 mb-3">
      <ShieldCheck className="h-10 w-10 text-primary sm:h-12 sm:w-12" />
      <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary">CryptoValidator</h1>
    </div>
    <p className="text-base sm:text-lg text-muted-foreground max-w-md px-2">
      A conceptual platform for exploring token validation and market identity.
    </p>
  </div>
);
export default AppTitle;
