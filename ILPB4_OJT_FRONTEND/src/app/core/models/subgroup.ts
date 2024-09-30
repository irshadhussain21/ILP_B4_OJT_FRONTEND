export interface SubGroup {
    subGroupId?: number;            // Optional, since the ID might not be present during creation
    marketId?: number;
    marketCode: string;      // Market code (two-letter code)
    subGroupCode: string;    // Subgroup code (single alphanumeric character)
    subGroupName: string;    // Name of the subgroup (market name)
  }