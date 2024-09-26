import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Market } from '../models/market';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarketService {

  constructor(private http:HttpClient) { }

  private readonly apiUrl = `${environment.apiUrl}/market`;
  // Method to create a new market
  createMarket(market: Market): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}`, market);
  }

  // Method to get a market by ID
  getMarketById(id: number): Observable<Market> {
    return this.http.get<Market>(`${this.apiUrl}/${id}`);
  }

  // Method to get all markets
  getAllMarkets(): Observable<Market[]> {
    return this.http.get<Market[]>(`${this.apiUrl}`);
  }
  
  
}
