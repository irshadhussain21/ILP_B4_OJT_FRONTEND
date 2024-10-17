export enum RegionEnum {
  EURO = 1,
  LAAPA = 2,
  NOAM = 3,
}
export const RegionFullForms: { [key in RegionEnum]: string } = {
  [RegionEnum.EURO]: 'EURO - Europe',
  [RegionEnum.LAAPA]: 'LAAPA - Latin America, Asia Pacific, and Africa',
  [RegionEnum.NOAM]: 'NOAM - North America',
};