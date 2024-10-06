export interface Market {
    id?: number;
    name: string;
    code: string;
    longMarketCode: string;
    region: string;
    subRegion: string;
    marketSubGroups: MarketSubgroup[];
}
 
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
    subGroupId?: number;     
    marketId?: number;
    marketCode: string;      
    subGroupCode: string;    
    subGroupName: string;    
  }