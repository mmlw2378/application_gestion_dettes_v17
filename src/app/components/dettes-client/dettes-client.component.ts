import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Dette } from '../../shared/models/dette';
import { Client } from '../../shared/models/client';
import { DetteService } from '../../shared/services/dette.service';
import { ClientService } from '../../shared/services/client.service';

@Component({
  selector: 'app-dettes-client',
  templateUrl: './dettes-client.component.html',
  styleUrls: ['./dettes-client.component.css']
})
export class DettesClientComponent implements OnInit {
  dettes: Dette[] = [];
  client: Client | null = null;
  clientId: number;
  loading = false;
  error = '';
  
  // Statistiques
  totalDettes = 0;
  totalMontantDettes = 0;
  totalMontantPaye = 0;
  totalMontantRestant = 0;
  dettesNonPayees = 0;
  dettesSoldees = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private detteService: DetteService,
    private clientService: ClientService
  ) {
    this.clientId = Number(this.route.snapshot.paramMap.get('clientId'));
  }

  ngOnInit(): void {
    this.loadClient();
    this.loadDettes();
  }

  loadClient(): void {
    this.clientService.getClientById(this.clientId).subscribe({
      next: (client) => {
        this.client = client;
      },
      error: (err) => {
        this.error = 'Client introuvable';
        console.error(err);
      }
    });
  }

  loadDettes(): void {
    this.loading = true;
    this.detteService.getDettesByClient(this.clientId).subscribe({
      next: (dettes) => {
        this.dettes = dettes;
        this.calculerStatistiques();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des dettes';
        this.loading = false;
        console.error(err);
      }
    });
  }

  calculerStatistiques(): void {
    this.totalDettes = this.dettes.length;
    this.totalMontantDettes = this.dettes.reduce((sum, dette) => sum + dette.montantDette, 0);
    this.totalMontantPaye = this.dettes.reduce((sum, dette) => sum + dette.montantPaye, 0);
    this.totalMontantRestant = this.dettes.reduce((sum, dette) => sum + dette.montantRestant, 0);
    this.dettesNonPayees = this.dettes.filter(dette => dette.montantPaye === 0).length;
    this.dettesSoldees = this.dettes.filter(dette => dette.montantRestant === 0).length;
  }

  ajouterDette(): void {
    this.router.navigate(['/dettes/ajouter', this.clientId]);
  }

  voirPaiements(detteId: number): void {
    this.router.navigate(['/paiements/dette', detteId]);
  }

  ajouterPaiement(detteId: number): void {
    this.router.navigate(['/paiements/ajouter', detteId]);
  }

  retourClients(): void {
    this.router.navigate(['/clients']);
  }

  getStatutDette(dette: Dette): string {
    if (dette.montantRestant === 0) {
      return 'Soldée';
    } else if (dette.montantPaye > 0) {
      return 'Partiellement payée';
    } else {
      return 'Non payée';
    }
  }

  getStatutClass(dette: Dette): string {
    if (dette.montantRestant === 0) {
      return 'bg-success';
    } else if (dette.montantPaye > 0) {
      return 'bg-warning';
    } else {
      return 'bg-danger';
    }
  }

  getPourcentagePaye(dette: Dette): number {
    return dette.montantDette > 0 ? (dette.montantPaye / dette.montantDette) * 100 : 0;
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' CFA';
  }

  recharger(): void {
    this.error = '';
    this.loadDettes();
  }
}