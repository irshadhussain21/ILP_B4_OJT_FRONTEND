import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class MarketService {
  private apiUrl = 'https://localhost:7058/api/Market'; 

  constructor(private http: HttpClient) {}

  // Method to get market details by ID
  getMarketById(marketId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${marketId}/details`);
  }
}
