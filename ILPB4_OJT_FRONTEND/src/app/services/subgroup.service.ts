import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MarketSubgroup } from '../core/models/market';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarketSubgroupService {
  private apiUrl = `${environment.apiUrl}/MarketSubgroup`;

  constructor(private http: HttpClient) {}

  // Retrieve subgroups related to the existing market code
  getSubgroups(marketCode: string): Observable<MarketSubgroup[]> {
    return this.http.get<MarketSubgroup[]>(`${this.apiUrl}?marketCode=${marketCode}`);
  }

} 