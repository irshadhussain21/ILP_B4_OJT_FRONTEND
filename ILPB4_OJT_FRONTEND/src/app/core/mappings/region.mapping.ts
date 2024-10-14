// region-mapping.ts
import { RegionEnum } from "../enums/region.enum";

export const RegionNames: { [key in RegionEnum]: string } = {
  [RegionEnum.EURO]: 'Europe',
  [RegionEnum.LAAPA]: 'Latin America, Asia Pacific, Africa',
  [RegionEnum.NOAM]: 'America, Canada',
};
