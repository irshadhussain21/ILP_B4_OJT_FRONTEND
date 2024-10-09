import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Market, MarketDetails } from '../core/models/market';
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
  getMarketById(marketId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${marketId}/details`);
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
   * Retrieves all market entries.
   *
   * @returns Observable<Market[]> An observable that emits an array of all Market objects.
   */
  getAllMarkets(): Observable<Market[]> {
    return this.http.get<Market[]>(`${this.apiUrl}`);
  }

  /**
   * Checks if a market code already exists.
   *
   * @param marketCode The market code to check for existence.
   * @returns Observable<boolean> An observable that emits true if the market code exists, otherwise false.
   */
  checkMarketCodeExists(marketCode: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-code`, {
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
    return this.http.get<boolean>(`${this.apiUrl}/check-name`, {
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

  searchMarkets(searchText: string): Observable<Market[]> {
    return this.http.get<Market[]>(`${this.apiUrl}/search`, {
        params: { name: searchText } // Assuming your API expects a query parameter
    });
}

}

