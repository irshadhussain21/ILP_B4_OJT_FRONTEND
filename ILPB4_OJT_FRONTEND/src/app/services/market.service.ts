import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Market } from '../core/models/market';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MarketService {
  private readonly apiUrl = `${environment.apiUrl}/market`;

  /**
   * Initializes the MarketService with the necessary dependencies.
   *
   * @param http The Angular HttpClient used for making HTTP requests.
   */
  constructor(private http: HttpClient) {}

  /**
   * Creates a new market entry.
   *
   * @param market The Market object containing market data to be created.
   * @returns Observable<number> An observable that emits the ID of the newly created market.
   */
  createMarket(market: Market): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}`, market);
  }


  /**
   * Retrieves market details by ID.
   *
   * @param marketId The ID of the market to retrieve.
   * @returns Observable<any> An observable that emits the details of the market.
   */
  getMarketDetailsById(marketId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${marketId}`);
  }

/**
 * Retrieves a paginated list of market entries, with an optional search text filter.
 *
 * @param {number} pageNumber - The page number to retrieve.
 * @param {number} pageSize - The number of items per page.
 * @param {string | null} searchText - The optional search text to filter the markets by name, code, or long code.
 * @returns {Observable<any>} An observable that emits the paginated response containing markets and metadata.
 */
  getAllMarkets(pageNumber: number, pageSize: number, searchText: string | null = null,region: string | null = null): Observable<any> {
  console.log('hi',typeof(region))


  let params = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  
  if (searchText) {
    params += `&searchText=${encodeURIComponent(searchText)}`;
    console.log('search text',searchText)
  }

  if (region) {
    params += `&regions=${encodeURIComponent(region)}`;
    console.log(params)
    console.log('region',region)
  }
 
  return this.http.get<Market[]>(`https://localhost:7058/api/Market?${params}`);
}


  /**
   * Checks if a market code already exists.
   *
   * @param marketCode The market code to check for existence.
   * @returns Observable<boolean> An observable that emits true if the market code exists, otherwise false.
   */
  checkMarketCodeExists(marketCode: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/code/${marketCode}/exists`, {
      params: { marketCode },
    });
  }

  /**
   * Checks if a market name already exists.
   *
   * @param marketName The market name to check for existence.
   * @returns Observable<boolean> An observable that emits true if the market name exists, otherwise false.
   */
  checkMarketNameExists(marketName: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/name/${marketName}/exists`, {
      params: { marketName },
    });
  }

  /**
   * Updates an existing market entry.
   *
   * @param marketId The ID of the market to update.
   * @param market The Market object containing updated market data.
   * @returns Observable<any> An observable that emits the response from the update operation.
   *
   * LLD:
   * 1. Uses HttpClient's `put` method to send a PUT request to update a market.
   * 2. The API endpoint URL is constructed using `this.apiUrl` and the market ID.
   * 3. The updated `Market` object is passed in the request body.
   * 4. Returns an Observable emitting the response of the update operation.
   */
  updateMarket(marketId: number, market: Market): Observable<any> {
    return this.http.put(`${this.apiUrl}/${marketId}`, market);
  }
    /**
    * Deletes a market entry by ID.
    *
    * @param marketId The ID of the market to delete.
    * @returns Observable<any> An observable that emits the response from the delete operation.
    */
  deleteMarket(marketId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${marketId}`);
  }
 
getMarketById(marketId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/${marketId}/details`);
}
}
