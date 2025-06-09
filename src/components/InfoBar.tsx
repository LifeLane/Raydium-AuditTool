
"use client";

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DollarSign, Droplets, HelpCircle } from "lucide-react";

interface InfoBarProps {
  raydiumPrice: string | null;
  currentLiquidity: string | null;
}

const InfoItem: FC<{ title: string; value: string | null; icon: React.ReactNode; tooltipText: string }> = ({ title, value, icon, tooltipText }) => (
  <Card className="flex-1 bg-card/80 shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {value !== null ? value : <span className="text-muted-foreground text-sm">Loading...</span>}
      </div>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="flex items-center text-xs text-muted-foreground cursor-help mt-1">
              <span>Illustrative Data</span>
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

const InfoBar: FC<InfoBarProps> = ({ raydiumPrice, currentLiquidity }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 w-full max-w-md mb-6">
      <InfoItem
        title="RAY Price (Illustrative)"
        value={raydiumPrice}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        tooltipText="This is a simulated Raydium token price for demonstration. Real applications would fetch this from a price oracle or API like CoinGecko."
      />
      <InfoItem
        title="Est. Liquidity (Illustrative)"
        value={currentLiquidity}
        icon={<Droplets className="h-4 w-4 text-muted-foreground" />}
        tooltipText="This is simulated liquidity data for demonstration. Real applications would fetch this from the Raydium SDK or an on-chain data provider."
      />
    </div>
  );
};

export default InfoBar;
