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

  // Update an existing subgroup entry
  updateSubgroup(id: number, subGroup: Partial<MarketSubgroup>): Observable<MarketSubgroup> {
    return this.http.put<MarketSubgroup>(`${this.apiUrl}/${id}`, subGroup);
  }

  // Retrieve subgroups related to the existing market code
  getSubgroups(marketCode: string): Observable<MarketSubgroup[]> {
    return this.http.get<MarketSubgroup[]>(`${this.apiUrl}?marketCode=${marketCode}`);
  }

  // Retrieve a specific subgroup by ID
  getSubgroupById(id: number): Observable<MarketSubgroup> {
    return this.http.get<MarketSubgroup>(`${this.apiUrl}/${id}`);
  }

  // Delete a subgroup
  deleteSubgroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}