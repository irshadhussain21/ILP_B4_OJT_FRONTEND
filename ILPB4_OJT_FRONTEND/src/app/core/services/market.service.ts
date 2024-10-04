import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Market } from '../models/market';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarketService {

  /**
   * The base URL for the API endpoints.
   */
  private readonly apiUrl = `${environment.apiUrl}/market`;

  /**
   * Initializes the MarketService with the necessary dependencies.
   * 
   * @param http The Angular HttpClient used for making HTTP requests.
   */
  constructor(private http: HttpClient) { }

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
   * Retrieves a market entry by its ID.
   * 
   * @param id The ID of the market to be retrieved.
   * @returns Observable<Market> An observable that emits the Market object retrieved by the ID.
   */
  getMarketById(id: number): Observable<Market> {
    return this.http.get<Market>(`${this.apiUrl}/${id}`);
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
   * 
   * LLD:
   * 1. Uses HttpClient's `get` method to send a GET request to check if a market code exists.
   * 2. The API endpoint URL is `this.apiUrl/check-code`.
   * 3. Passes the `marketCode` as a query parameter.
   * 4. Returns an Observable emitting true if the code exists, or false if it does not.
   */
  checkMarketCodeExists(marketCode: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-code`, {
      params: { marketCode }
    });
  }

  /**
   * Checks if a market name already exists.
   * 
   * @param marketName The market name to check for existence.
   * @returns Observable<boolean> An observable that emits true if the market name exists, otherwise false.
   * 
   * LLD:
   * 1. Uses HttpClient's `get` method to send a GET request to check if a market name exists.
   * 2. The API endpoint URL is `this.apiUrl/check-name`.
   * 3. Passes the `marketName` as a query parameter.
   * 4. Returns an Observable emitting true if the name exists, or false if it does not.
   */
  checkMarketNameExists(marketName: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-name`, {
      params: { marketName }
    });
  }
}
