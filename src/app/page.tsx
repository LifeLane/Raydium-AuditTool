
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import AppTitle from "@/components/AppTitle";
import InfoBar from "@/components/InfoBar";
import { Loader2, Box, GitCompareArrows, Network, CheckCircle, AlertTriangle, Copy, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { RECIPIENT_ADDRESS, TRANSACTION_AMOUNT_ETH_STRING, TRANSACTION_VALUE_WEI_HEX } from "@/lib/constants";
import { Alert, AlertDescription as UIDialogAlertDescription, AlertTitle as UIDialogAlertTitle } from "@/components/ui/alert";


type TransactionState = "idle" | "connecting" | "awaiting_confirmation" | "sending" | "success" | "error";

export default function CryptoValidatorPage() {
  const [isClient, setIsClient] = useState(false);
  const [tokenCA, setTokenCA] = useState("");
  const [contractCode, setContractCode] = useState("");
  const [isCodeSubmitted, setIsCodeSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("pasteContract");
  
  const [showPaymentInterface, setShowPaymentInterface] = useState(false);
  const [selectedValidationType, setSelectedValidationType] = useState("");
  const [transactionState, setTransactionState] = useState<TransactionState>("idle");
  const [transactionMessage, setTransactionMessage] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false); // Used for "Pay with Wallet" button

  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCodeSubmit = () => {
    if (contractCode.trim() === "") {
      toast({
        title: "Error",
        description: "Please paste your contract code before submitting.",
        variant: "destructive",
      });
      return;
    }
    setIsCodeSubmitted(true);
    setActiveTab("tokenCA");
    toast({
      title: (
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-primary" />
          <span>Code Submitted</span>
        </div>
      ),
      description: "Smart contract code submitted successfully. You can now proceed to validate your Token CA.",
    });
  };

  const handleInitiateValidation = (validationType: string) => {
    if (tokenCA.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Please enter a Token Contract Address before proceeding.",
        variant: "destructive",
      });
      return;
    }
    setSelectedValidationType(validationType);
    setTransactionState("idle");
    setTransactionMessage("");
    setShowPaymentInterface(true);
  };

  const simulateTransaction = async () => {
    setIsProcessingPayment(true);

    setTransactionState("connecting");
    setTransactionMessage("Connecting to your wallet... Please check your wallet extension.");
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate user interaction or wallet check
    if (Math.random() < 0.05) { // 5% chance of "connection failure"
        setTransactionState("error");
        setTransactionMessage("Failed to connect to wallet. Please ensure it's available and try again.");
        setIsProcessingPayment(false);
        return;
    }

    setTransactionState("awaiting_confirmation");
    setTransactionMessage("Please confirm the transaction for " + TRANSACTION_AMOUNT_ETH_STRING + " ETH in your wallet.");
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate user confirming or rejecting
     if (Math.random() < 0.05) { // 5% chance of user rejection
        setTransactionState("error");
        setTransactionMessage("Transaction rejected. If this was a mistake, please try again.");
        setIsProcessingPayment(false);
        return;
    }

    setTransactionState("sending");
    setTransactionMessage("Processing transaction... This may take a few moments.");
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // Simulate transaction success or blockchain error
    if (Math.random() < 0.1) { // 10% chance of "blockchain error"
        setTransactionState("error");
        setTransactionMessage("Transaction failed due to a network error. Please try again.");
        setIsProcessingPayment(false);
        return;
    }

    setTransactionState("success");
    setTransactionMessage(`Transaction for ${TRANSACTION_AMOUNT_ETH_STRING} ETH initiated successfully! Your market ID setup for '${selectedValidationType}' will begin once confirmed on the blockchain.`);
    setIsProcessingPayment(false);
    //
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: "Copied to clipboard!", description: text });
    }).catch(err => {
      toast({ title: "Failed to copy", description: "Could not copy text to clipboard.", variant: "destructive" });
    });
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

  const ctaSections = [
    {
      title: "Standard Validation",
      icon: <Box className="h-6 w-6 text-primary" />,
      description: "Essential token validation and market ID setup on its native blockchain. Ensures your token is recognized and ready for liquidity.",
      feeNote: `Process Fee: ${TRANSACTION_AMOUNT_ETH_STRING} ETH for market ID deployment and initial validation.`,
      buttonText: "Initiate Standard Validation",
      validationType: "Standard Validation"
    },
    {
      title: "Enhanced Cross-Check",
      icon: <GitCompareArrows className="h-6 w-6 text-primary" />,
      description: "Comprehensive validation with cross-referencing capabilities for tokens aiming for broader interoperability. Includes standard market ID setup.",
      feeNote: `Process Fee: ${TRANSACTION_AMOUNT_ETH_STRING} ETH for market ID deployment and enhanced validation.`,
      buttonText: "Initiate Enhanced Validation",
      validationType: "Enhanced Validation"
    },
    {
      title: "Premier Multi-Chain Presence",
      icon: <Network className="h-6 w-6 text-primary" />,
      description: "Top-tier validation designed for tokens with a multi-chain strategy, ensuring maximum visibility and compatibility. Includes standard market ID setup.",
      feeNote: `Process Fee: ${TRANSACTION_AMOUNT_ETH_STRING} ETH for market ID deployment and premier validation.`,
      buttonText: "Initiate Premier Validation",
      validationType: "Premier Validation"
    }
  ];

  const getTransactionStatusIcon = () => {
    switch (transactionState) {
      case "connecting":
      case "awaiting_confirmation":
      case "sending":
        return <Loader2 className="h-5 w-5 animate-spin mr-2" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500 mr-2" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />;
      default:
        return null;
    }
  };


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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" defaultValue="pasteContract">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto bg-card text-card-foreground p-1 rounded-md">
              <TabsTrigger
                value="pasteContract"
                className="text-base py-3 data-[state=active]:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:text-sm sm:py-1.5"
              >
                1. Paste Contract Code
              </TabsTrigger>
              {isCodeSubmitted && (
                <TabsTrigger
                  value="tokenCA"
                  className="text-base py-3 data-[state=active]:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:text-sm sm:py-1.5"
                >
                  2. Validate & Deploy Market ID
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="pasteContract" className="mt-6 p-4 border rounded-md bg-card/50">
              <div className="flex flex-col items-center text-center">
                <h3 className="text-xl font-semibold mb-2">Submit Your Smart Contract</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  To begin, paste your smart contract code (e.g., Solidity, Rust) into the text area below.
                  This is a required first step. After submitting, you'll proceed to validate your Token Contract Address.
                </p>
                <div className="w-full max-w-md mx-auto mb-6">
                  <Label htmlFor="contractCodeArea" className="sr-only">Smart Contract Code</Label>
                  <Textarea
                    id="contractCodeArea"
                    placeholder="Paste your Solidity or Rust smart contract code here..."
                    value={contractCode}
                    onChange={(e) => setContractCode(e.target.value)}
                    className="min-h-[200px] text-sm p-3 bg-card/70 border-border"
                    disabled={isCodeSubmitted}
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleCodeSubmit}
                  className="w-full max-w-md mx-auto"
                  disabled={!contractCode.trim() || isCodeSubmitted}
                >
                  {isCodeSubmitted ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Code Submitted
                    </>
                  ) : "Submit Contract Code"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="tokenCA" className="mt-6 p-4 border rounded-md bg-card/50">
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
                    />
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      This is the unique identifier for your token on the Solana blockchain. Ensure you have submitted your contract code in the previous tab.
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
                            onClick={() => handleInitiateValidation(cta.validationType)}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2 py-3 text-base"
                            disabled={!tokenCA}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showPaymentInterface} onOpenChange={setShowPaymentInterface}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Confirm Payment: {selectedValidationType}</DialogTitle>
            <DialogDescription className="text-center">
              To proceed with the {selectedValidationType}, please send {TRANSACTION_AMOUNT_ETH_STRING} ETH to the specified address.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-6">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Recipient Address (Ethereum)</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input type="text" value={RECIPIENT_ADDRESS} readOnly className="bg-muted/50 truncate" />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(RECIPIENT_ADDRESS)}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copy Address</span>
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
              <Input type="text" value={`${TRANSACTION_AMOUNT_ETH_STRING} ETH`} readOnly className="bg-muted/50 mt-1" />
            </div>

            <Card className="p-4 bg-card/70 flex flex-col items-center">
              <p className="text-sm text-center mb-3 text-muted-foreground">
                Or scan with your mobile wallet:
              </p>
              <div className="p-2 bg-white rounded-md inline-block shadow-md">
                <Image
                  src="/payment_qr.png"
                  alt="Payment QR Code"
                  width={160}
                  height={160}
                  data-ai-hint="QR code ethereum address"
                />
              </div>
            </Card>
            
            {transactionState !== 'idle' && (
              <Alert variant={transactionState === 'error' ? 'destructive' : 'default'} className="mt-4">
                {getTransactionStatusIcon()}
                <UIDialogAlertTitle className={transactionState === 'success' ? 'text-green-500' : transactionState === 'error' ? 'text-red-500' : ''}>
                  {transactionState === 'idle' ? 'Status' : transactionState.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </UIDialogAlertTitle>
                <UIDialogAlertDescription>
                  {transactionMessage}
                </UIDialogAlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="sm:justify-center">
            {transactionState !== 'success' && (
            <Button 
              type="button" 
              onClick={simulateTransaction} 
              className="w-full sm:w-auto"
              disabled={isProcessingPayment || transactionState === 'success'}
            >
              {isProcessingPayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Pay {TRANSACTION_AMOUNT_ETH_STRING} ETH with Wallet
            </Button>
            )}
             <Button type="button" variant="outline" onClick={() => setShowPaymentInterface(false)}  className="w-full sm:w-auto">
              {transactionState === 'success' ? 'Close' : 'Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
