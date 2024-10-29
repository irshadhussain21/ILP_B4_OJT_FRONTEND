export interface Market {
    id?: number;
    name: string;
    code: string;
    longMarketCode: string;
    region: string;
    subRegion: string;
    marketSubGroups?: MarketSubgroup[];
} 
 
export interface MarketSubgroup {
    subGroupId?: number | null;     
    marketId?: number;
    marketCode: string;      
    subGroupCode: string;    
    subGroupName: string;
    isEdited: boolean;
    isDeleted: boolean;    
  }