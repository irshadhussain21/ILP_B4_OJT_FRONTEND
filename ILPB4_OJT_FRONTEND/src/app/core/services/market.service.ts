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
   * 
   * LLD:
   * 1. Uses HttpClient's `post` method to send a POST request to create a new market.
   * 2. The API endpoint URL is `this.apiUrl`.
   * 3. The request body is the `market` object.
   * 4. Returns an Observable emitting the ID of the created market.
   */
  createMarket(market: Market): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}`, market);
  }

  /**
   * Retrieves a market entry by its ID.
   * 
   * @param id The ID of the market to be retrieved.
   * @returns Observable<Market> An observable that emits the Market object retrieved by the ID.
   * 
   * LLD:
   * 1. Uses HttpClient's `get` method to send a GET request to fetch a market by ID.
   * 2. The API endpoint URL is `this.apiUrl/{id}`, where `{id}` is the market ID.
   * 3. Returns an Observable emitting the Market object corresponding to the given ID.
   */
  getMarketById(id: number): Observable<Market> {
    return this.http.get<Market>(`${this.apiUrl}/${id}`);
  }

  /**
   * Retrieves all market entries.
   * 
   * @returns Observable<Market[]> An observable that emits an array of all Market objects.
   * 
   * LLD:
   * 1. Uses HttpClient's `get` method to send a GET request to fetch all markets.
   * 2. The API endpoint URL is `this.apiUrl`.
   * 3. Returns an Observable emitting an array of all available markets.
   */
  getAllMarkets(): Observable<Market[]> {
    return this.http.get<Market[]>(`${this.apiUrl}`);
  }
}
