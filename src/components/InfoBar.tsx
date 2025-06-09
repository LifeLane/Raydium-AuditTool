
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DollarSign, TrendingUp, AlertCircle, HelpCircle, Loader2 } from "lucide-react";

interface RaydiumData {
  usd: number;
  usd_market_cap: number;
}

interface InfoBarProps {}

const formatMarketCap = (value: number | null): string => {
  if (value === null) return 'N/A';
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(2)}`;
};

const InfoItem: FC<{ title: string; value: string | null; icon: React.ReactNode; isLoading: boolean; error?: string | null; tooltipText: string }> = ({ title, value, icon, isLoading, error, tooltipText }) => (
  <Card className="flex-1 bg-card/80 shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        ) : error ? (
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <span className="text-destructive text-sm flex items-center">
                  <AlertCircle className="h-5 w-5 mr-1" /> Error
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="max-w-xs">{error}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          value
        )}
      </div>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="flex items-center text-xs text-muted-foreground cursor-help mt-1">
              <span>Data from CoinGecko</span>
              <HelpCircle className="h-3 w-3 ml-1" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="max-w-xs">{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </CardContent>
  </Card>
);

const InfoBar: FC<InfoBarProps> = () => {
  const [raydiumData, setRaydiumData] = useState<RaydiumData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaydiumData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=raydium&vs_currencies=usd&include_market_cap=true');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data.raydium && typeof data.raydium.usd === 'number' && typeof data.raydium.usd_market_cap === 'number') {
          setRaydiumData(data.raydium);
        } else {
          throw new Error('Invalid data format received from API.');
        }
      } catch (err: any) {
        console.error("Error fetching Raydium data:", err);
        setError(err.message || 'Could not fetch data.');
        setRaydiumData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRaydiumData();
    const intervalId = setInterval(fetchRaydiumData, 60000); // Refresh every 60 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 w-full max-w-md mb-6">
      <InfoItem
        title="RAY Price"
        value={raydiumData ? `$${raydiumData.usd.toFixed(2)}` : 'N/A'}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
        error={error && !raydiumData?.usd ? error : undefined}
        tooltipText="Live Raydium (RAY) token price in USD, fetched from CoinGecko API."
      />
      <InfoItem
        title="RAY Market Cap"
        value={formatMarketCap(raydiumData?.usd_market_cap ?? null)}
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        isLoading={isLoading}
        error={error && !raydiumData?.usd_market_cap ? error : undefined}
        tooltipText="Live Raydium (RAY) market capitalization in USD, fetched from CoinGecko API."
      />
    </div>
  );
};

export default InfoBar;
