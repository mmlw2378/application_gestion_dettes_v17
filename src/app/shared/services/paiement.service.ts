import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Paiement } from '../models/paiement';
import { DetteService } from './dette.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private apiUrl = `${environment.api}/paiements`;

  constructor(
    private http: HttpClient,
    private detteService: DetteService
  ) { }

  getPaiements(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(this.apiUrl);
  }

  getPaiementsByDette(detteId: number): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(`${this.apiUrl}?detteId=${detteId}`);
  }

  addPaiement(paiement: Paiement): Observable<Paiement> {
    return this.http.post<Paiement>(this.apiUrl, paiement)
      .pipe(
        switchMap(newPaiement => {
          return this.detteService.recalculerMontants(paiement.detteId)
            .pipe(map(() => newPaiement));
        })
      );
  }

  deletePaiement(id: number, detteId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        switchMap(() => {
          return this.detteService.recalculerMontants(detteId)
            .pipe(map(() => void 0));
        })
      );
  }
}