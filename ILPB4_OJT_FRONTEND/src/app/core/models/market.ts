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
    subGroupName: string;
    subGroupCode: string;
    marketCode: string;
}
