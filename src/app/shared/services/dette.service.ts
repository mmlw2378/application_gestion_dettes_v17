import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Dette } from '../models/dette';
import { Paiement } from '../models/paiement';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DetteService {
  private apiUrl = `${environment.api}/dettes`;
  private paiementsUrl = `${environment.api}/paiements`;

  constructor(private http: HttpClient) { }

  getDettes(): Observable<Dette[]> {
    return this.http.get<Dette[]>(this.apiUrl);
  }

  getDetteById(id: number): Observable<Dette> {
    return this.http.get<Dette>(`${this.apiUrl}/${id}`);
  }

  getDettesByClient(clientId: number): Observable<Dette[]> {
    return this.http.get<Dette[]>(`${this.apiUrl}?clientId=${clientId}`);
  }

  addDette(dette: Dette): Observable<Dette> {
    dette.montantPaye = 0;
    dette.montantRestant = dette.montantDette;
    return this.http.post<Dette>(this.apiUrl, dette);
  }

  updateDette(dette: Dette): Observable<Dette> {
    return this.http.put<Dette>(`${this.apiUrl}/${dette.id}`, dette);
  }

  recalculerMontants(detteId: number): Observable<Dette> {
    return this.http.get<Paiement[]>(`${this.paiementsUrl}?detteId=${detteId}`)
      .pipe(
        switchMap(paiements => {
          const montantPaye = paiements.reduce((total, p) => total + p.montant, 0);
          
          return this.getDetteById(detteId).pipe(
            switchMap(dette => {
              dette.montantPaye = montantPaye;
              dette.montantRestant = dette.montantDette - montantPaye;
              return this.updateDette(dette);
            })
          );
        })
      );
  }
}