import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Market } from '../features/market-list/market-list.component';

@Injectable({
  providedIn: 'root'
})
export class MarketlistService {

  private apiUrl = 'https://localhost:7058/api/Market'; 

  constructor(private http: HttpClient) {}

  getMarkets(): Observable<Market[]> {
    return this.http.get<Market[]>(this.apiUrl);
  }
}
