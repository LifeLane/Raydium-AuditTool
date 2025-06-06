
"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AppTitle from "@/components/AppTitle";
import { RECIPIENT_ADDRESS, TRANSACTION_VALUE_WEI_HEX, RAYDIUM_LIQUIDITY_POOL_URL, TRANSACTION_AMOUNT_ETH_STRING } from "@/lib/constants";
import { Loader2, AlertCircle, CheckCircle2, Wallet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function CryptoValidatorPage() {
  const [isClient, setIsClient] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [tokenCA, setTokenCA] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false); // For wallet connection and initial loading
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false); // For payment transaction
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [hasProvider, setHasProvider] = useState<boolean | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window.ethereum !== 'undefined') {
      console.log("window.ethereum detected. Provider:", window.ethereum);
      setHasProvider(true);
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          console.warn("Wallet disconnected or no accounts approved by user.");
          setAccount(null);
          setError("Wallet disconnected. Please ensure your wallet is connected and has approved this site.");
        } else {
          setAccount(accounts[0]);
          setError(null); 
        }
      };

      const fetchInitialAccount = async () => {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setError(null);
          } else {
            setAccount(null); // Ensure account is null if no accounts are passively found
          }
        } catch (err: any) {
          const errorMessageString = getErrorMessageString(err);
          console.warn("Error fetching initial accounts (passive check):", errorMessageString);
           if (errorMessageString.includes("Nightly is not initialized")) {
            setError("Detected Nightly wallet is not initialized. Please ensure it's set up correctly or try a different wallet like MetaMask.");
          } else {
            // Do not set a general error here for passive checks to avoid premature error messages
            // unless it's a known issue like Nightly
          }
        }
      };

      fetchInitialAccount();
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (window.ethereum && typeof window.ethereum.removeListener === 'function') {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    } else {
      console.warn("window.ethereum not detected on page load.");
      setHasProvider(false);
    }
  }, []);
  
  const getErrorMessageString = (err: any): string => {
    if (!err) {
      return 'An unknown error occurred (no error object provided).';
    }
    if (typeof err.message === 'string' && err.message.trim() !== '') {
      return err.message;
    }
    if (typeof err === 'string' && err.trim() !== '') {
      return err;
    }
    if (typeof err.toString === 'function') {
        const errStr = err.toString();
        if (errStr !== '[object Object]' && errStr.trim() !== '') {
            return errStr;
        }
    }
    try {
      const jsonError = JSON.stringify(err);
      if (jsonError !== '{}') return jsonError;
    } catch (e) {
      // Fallthrough
    }
    return 'An unknown error occurred.';
  };

  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      setError("No Ethereum wallet detected. Please install an Ethereum wallet like MetaMask or Trust Wallet extension and ensure it's active.");
      console.warn("handleConnectWallet: No Ethereum provider found (window.ethereum is undefined).");
      return;
    }
    if (typeof window.ethereum.request !== 'function') {
      setError("The detected Ethereum wallet provider is not functioning correctly (missing request method). Please check your wallet extension or try a different browser.");
      console.error("handleConnectWallet: window.ethereum.request is not a function. Provider:", window.ethereum);
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log("Attempting to connect wallet using eth_requestAccounts...");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setError(null); 
        console.log("Wallet connected successfully. Account:", accounts[0], "Provider isMetaMask:", !!window.ethereum.isMetaMask);
      } else {
        setError("No accounts found after connection attempt. Please ensure you've approved connection in your wallet and selected an account.");
        console.warn("handleConnectWallet: eth_requestAccounts returned an empty list of accounts.");
        setAccount(null);
      }
    } catch (err: any) {
      const errorMessageString = getErrorMessageString(err);
      if (errorMessageString.includes("Nightly is not initialized")) {
        setError("Nightly wallet is not initialized. Please ensure it's set up correctly or try a different wallet like MetaMask.");
        console.warn("Wallet connection error (Nightly):", errorMessageString);
      } else if ((err as any).code === 4001) { // Standard EIP-1193 user rejection error
        setError("Wallet connection rejected by user.");
        console.warn("Wallet connection rejected by user (Error Code 4001):", err);
      } else if (errorMessageString.toLowerCase().includes("unexpected error")) {
         setError("An unexpected error occurred with your wallet. Please check your wallet extension or try again.");
         console.warn("Wallet connection unexpected error:", errorMessageString);
      }
      else {
        setError(`Failed to connect wallet: ${errorMessageString}`);
        console.error("Generic wallet connection error:", err);
      }
      setAccount(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (event: FormEvent) => {
    event.preventDefault();
    console.log("handlePayment initiated.");

    if (!account) {
      setError("Please connect your wallet before proceeding with payment.");
      console.warn("handlePayment: Aborted - Wallet not connected.");
      return;
    }
    console.log("handlePayment: Wallet connected with account:", account);

    if (!tokenCA.trim()) {
      setError("Please enter a valid Token Contract Address (CA).");
      console.warn("handlePayment: Aborted - Token CA is empty.");
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenCA.trim())) {
      setError("Invalid Token Contract Address format. It should be a 40-character hex string starting with 0x.");
      console.warn("handlePayment: Aborted - Invalid Token CA format:", tokenCA.trim());
      return;
    }
    console.log("handlePayment: Token CA is valid:", tokenCA.trim());

    setIsProcessingPayment(true);
    setError(null);
    console.log(`handlePayment: Attempting transaction to ${RECIPIENT_ADDRESS} for ${TRANSACTION_AMOUNT_ETH_STRING} ETH from account ${account}...`);

    try {
      if (!window.ethereum || typeof window.ethereum.request !== 'function') {
        setError("Ethereum wallet provider is not available or not functioning correctly. Cannot proceed with payment.");
        console.error("handlePayment: window.ethereum.request is not available/function. Aborting transaction.");
        setIsProcessingPayment(false);
        return;
      }

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: RECIPIENT_ADDRESS,
          value: TRANSACTION_VALUE_WEI_HEX,
        }],
      });
      console.log("Transaction sent. Hash:", txHash);
      setShowSuccessDialog(true);

    } catch (err: any) {
      const errorMessageString = getErrorMessageString(err);
      console.error("Payment transaction error object:", JSON.stringify(err, null, 2));
      if ((err as any).code === 4001) { 
        setError("Transaction rejected by user.");
        console.warn("Transaction rejected by user (Error Code 4001):", err);
      } else if (errorMessageString.includes("Nightly is not initialized")) {
        setError("Nightly wallet is not initialized. Please ensure it's set up correctly before making a transaction.");
         console.warn("Payment error (Nightly):", errorMessageString);
      } else if (errorMessageString.toLowerCase().includes("insufficient funds")) {
        setError("Transaction failed due to insufficient funds.");
        console.warn("Transaction failed: Insufficient funds.", errorMessageString);
      } else if (errorMessageString.toLowerCase().includes("unexpected error")) {
         setError("An unexpected error occurred with your wallet during the transaction. Please check your wallet or try again.");
         console.warn("Payment transaction unexpected error:", errorMessageString);
      }
      else {
        setError(`Transaction failed: ${errorMessageString}`);
        console.error("Generic payment transaction error:", err);
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleProceedToRaydium = () => {
    window.open(RAYDIUM_LIQUIDITY_POOL_URL, "_blank", "noopener,noreferrer");
    setShowSuccessDialog(false);
    setTokenCA(""); 
    setError(null); 
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
          <CardTitle className="text-2xl font-headline text-center">Validate & Secure Market ID</CardTitle>
          <CardDescription className="text-center">
            Connect your wallet, submit your token CA, and pay {TRANSACTION_AMOUNT_ETH_STRING} ETH to secure its market ID before proceeding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!account ? (
            <Button 
              onClick={handleConnectWallet} 
              disabled={isLoading || (isClient && hasProvider === false)} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Wallet className="mr-2 h-5 w-5" />
              )}
              {isLoading ? "Connecting..." : (hasProvider === false ? "Wallet Not Detected" : "Connect Wallet")}
            </Button>
          ) : (
            <div className="text-center text-sm p-2 border rounded-md bg-secondary">
              Connected: <span className="font-medium break-all">{account}</span>
            </div>
          )}

          {account && (
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
                  disabled={isProcessingPayment}
                  required
                  className="bg-input border-border focus:ring-primary focus:border-primary"
                />
              </div>

              <Button type="submit" disabled={isProcessingPayment || !account} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                {isProcessingPayment ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                )}
                {isProcessingPayment ? "Processing Payment..." : `Validate & Pay ${TRANSACTION_AMOUNT_ETH_STRING} ETH`}
              </Button>
            </form>
          )}
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
            <AlertDialogTitle className="text-accent font-headline text-2xl">Payment Successful!</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Your payment of {TRANSACTION_AMOUNT_ETH_STRING} ETH for token validation and market ID setup was successful. You can now proceed to the liquidity pool.
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
        <p className="mt-1">This application facilitates token validation and market ID setup via an Ethereum transaction.</p>
      </footer>
    </main>
  );
}
