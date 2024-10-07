export interface Market {
    id?: number;
    name: string;
    code: string;
    longMarketCode: string;
    region: string;
    subRegion: string;
<<<<<<< HEAD
    marketSubGroups?: MarketSubgroup[];
 
} 

=======
}
 
>>>>>>> fc584988bebf8447f30b75ba610ea44073178244
export interface MarketDetails {
    marketId: number;
    marketName: string;
    marketCode: string;
    longMarketCode: string;
    region: string;
    subRegion: string;
    marketSubGroups: MarketSubgroup[];
}
 
export interface MarketSubgroup {
    subGroupCode: string;
    subGroupId: number;
    subGroupName: string;
 
}