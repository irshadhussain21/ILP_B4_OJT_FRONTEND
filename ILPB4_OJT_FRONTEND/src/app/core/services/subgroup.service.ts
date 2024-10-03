import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubGroup } from '../models/subgroup';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarketSubgroupService {
  private apiUrl = `${environment.apiUrl}/MarketSubgroup`;

  constructor(private http: HttpClient) {}

  // Create a new subgroup
  createSubgroup(subGroup: Partial<SubGroup>): Observable<SubGroup> {
    return this.http.post<SubGroup>(`${this.apiUrl}`, subGroup);
  }

  // Update an existing subgroup entry
  updateSubgroup(id: number, subGroup: Partial<SubGroup>): Observable<SubGroup> {
    return this.http.put<SubGroup>(`${this.apiUrl}/${id}`, subGroup);
  }

  // Retrieve subgroups related to the existing market code
  getSubgroups(marketCode: string): Observable<SubGroup[]> {
    return this.http.get<SubGroup[]>(`${this.apiUrl}?marketCode=${marketCode}`);
  }

  // Retrieve a specific subgroup by ID
  getSubgroupById(id: number): Observable<SubGroup> {
    return this.http.get<SubGroup>(`${this.apiUrl}/${id}`);
  }

  // Delete a subgroup
  deleteSubgroup(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
