import { MarketSubgroup } from './market-subgroup'

export interface MarketDetails {
    marketId: number;
    marketName: string;
    marketCode: string;
    longMarketCode: string;
    region: string;
    subRegion: string;
    marketSubGroups: MarketSubgroup[];
}
