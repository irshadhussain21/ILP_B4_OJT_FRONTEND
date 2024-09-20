// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class MarketService {

//   constructor() { }
// }
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  constructor(private http: HttpClient) {}

  getMarketDetails(marketCode: string): Observable<any> {
    // Replace with your API endpoint
    return this.http.get(`/api/markets/${marketCode}`);
  }
}
