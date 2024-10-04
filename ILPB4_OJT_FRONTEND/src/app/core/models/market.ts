

export interface Market {
    id?: number;
    name: string;
    code: string;
    longMarketCode: string;
    region: string;
    subRegion: string;
    subGroups: SubGroup[];
}

export interface SubGroup {
    subGroupId?: number;
    marketId?:number;
    subGroupName: string;
    subGroupCode: string;
    marketCode: string;
} 

export interface MarketDetails {
    marketId: number;
    marketName: string;
    marketCode: string;
    longMarketCode: string;
    region: string;
    subRegion: string;
    marketSubGroups: SubGroup[];
} 


