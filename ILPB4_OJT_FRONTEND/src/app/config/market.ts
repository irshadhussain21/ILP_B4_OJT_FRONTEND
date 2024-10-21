import { RegionEnum } from "../core/enums/region.enum";

export const CreateMarketConfig = {
    TITLE_CREATE: 'Create Market',
    TITLE_EDIT: 'Edit Market',
    MAX_MARKET_CODE_LENGTH: 2,
    MIN_MARKET_CODE_LENGTH: 2,
    MAX_LONG_CODE_LENGTH: 50,
    MIN_LONG_CODE_LENGTH: 7,
    MARKET_CODE_VALIDATION_REGEX: /^[a-zA-Z]+$/,
    MESSAGES:{
    SUCCESS_MESSAGES:{
        MARKET_CREATED:"PAGE.TOAST_MESSAGE.SUCCESS_MARKET.CREATED",
        MARKET_UPDATED:"PAGE.TOAST_MESSAGE.SUCCESS_MARKET.UPDATED"
    } ,  
    ERROR_MESSAGES: {
      CREATE:"PAGE.TOAST_MESSAGE.ERROR_MARKET.CREATE",
      UPDATE:"PAGE.TOAST_MESSAGE.ERROR_MARKET.UPDATE",
      REQUIRED_MARKET_CODE: 'PAGE.PLACEHOLDERS.ERROR_MARKET_CODE_REQUIRED',
      REQUIRED_MARKET_NAME: 'PAGE.PLACEHOLDERS.ERROR_MARKET_NAME_REQUIRED',
      MARKET_CODE_EXISTS: 'PAGE.PLACEHOLDERS.ERROR_MARKET_CODE_EXISTS',
      MARKET_NAME_EXISTS: 'PAGE.PLACEHOLDERS.ERROR_MARKET_NAME_EXISTS',
    },
    CONFIRM:"PAGE.TOAST_MESSAGE.CONFIRM.CANCEL"
  
},
    BUTTONS: {
      UPDATE_MARKET: 'PAGE.BUTTONS.UPDATE_MARKET',
      CREATE_MARKET: 'PAGE.BUTTONS.CREATE_MARKET',
    },
    
  };
  

  export const RegionNames: { [key in RegionEnum]: string } = {
    [RegionEnum.EURO]: 'Europe',
    [RegionEnum.LAAPA]: 'Latin America, Asia Pacific, Africa',
    [RegionEnum.NOAM]: 'America, Canada',
  };
  
  export const PaginationConstants={
    rowsPerPageOptions: [10, 25, 50, 75, 100],
    defaultRows: 10,
  }