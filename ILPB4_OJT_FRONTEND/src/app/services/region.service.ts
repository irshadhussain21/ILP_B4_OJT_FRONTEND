import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Region } from '../core/models/region';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  // Base URL for the API (replace with environment variable in a real project)
  private readonly apiUrl = `${environment.apiUrl}/Region`; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  /**
   * Fetches all available regions from the backend API.
   *
   * @returns {Observable<Region[]>} An observable containing a list of all regions
   */
  getAllRegions(): Observable<Region[]> {
    return this.http.get<Region[]>(`${this.apiUrl}/all-regions`);
  }

  /**
   * Fetches subregions based on the specified region ID from the backend API.
   *
   * @param {number} regionId - The ID of the selected region
   * @returns {Observable<Region[]>} An observable containing a list of subregions for the specified region
   */
  getSubRegionsByRegion(regionId: number): Observable<Region[]> {
    return this.http.get<Region[]>(`${this.apiUrl}/${regionId}/subregions`);
  }
}
