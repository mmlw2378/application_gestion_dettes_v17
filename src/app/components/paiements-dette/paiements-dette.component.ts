import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Dette } from '../../shared/models/dette';
import { Client } from '../../shared/models/client';
import { Paiement } from '../../shared/models/paiement';
import { DetteService } from '../../shared/services/dette.service';
import { ClientService } from '../../shared/services/client.service';
import { PaiementService } from '../../shared/services/paiement.service';

@Component({
  selector: 'app-paiements-dette',
  templateUrl: './paiements-dette.component.html',
  styleUrls: ['./paiements-dette.component.css']
})
export class PaiementsDetteComponent implements OnInit {
  paiements: Paiement[] = [];
  dette: Dette | null = null;
  client: Client | null = null;
  detteId: number;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private detteService: DetteService,
    private clientService: ClientService,
    private paiementService: PaiementService
  ) {
    this.detteId = Number(this.route.snapshot.paramMap.get('detteId'));
  }

  ngOnInit(): void {
    this.loadDette();
    this.loadPaiements();
  }

  loadDette(): void {
    this.detteService.getDetteById(this.detteId).subscribe({
      next: (dette) => {
        this.dette = dette;
        this.loadClient(dette.clientId);
      },
      error: (err) => {
        this.error = 'Dette introuvable';
        console.error(err);
      }
    });
  }

  loadClient(clientId: number): void {
    this.clientService.getClientById(clientId).subscribe({
      next: (client) => {
        this.client = client;
      },
      error: (err) => {
        console.error('Erreur chargement client:', err);
      }
    });
  }

  loadPaiements(): void {
    this.loading = true;
    this.paiementService.getPaiementsByDette(this.detteId).subscribe({
      next: (paiements) => {
        this.paiements = paiements.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des paiements';
        this.loading = false;
        console.error(err);
      }
    });
  }

  ajouterPaiement(): void {
    this.router.navigate(['/paiements/ajouter', this.detteId]);
  }

  retourDettes(): void {
    if (this.dette) {
      this.router.navigate(['/dettes/client', this.dette.clientId]);
    }
  }

  supprimerPaiement(paiement: Paiement): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ce paiement de ${this.formatCurrency(paiement.montant)} ?`)) {
      this.paiementService.deletePaiement(paiement.id!, this.detteId).subscribe({
        next: () => {
          this.loadDette();
          this.loadPaiements();
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression du paiement';
          console.error(err);
        }
      });
    }
  }

  getTotalPaiements(): number {
    return this.paiements.reduce((total, paiement) => total + paiement.montant, 0);
  }

  getStatutDette(): string {
    if (!this.dette) return '';
    
    if (this.dette.montantRestant === 0) {
      return 'Soldée';
    } else if (this.dette.montantPaye > 0) {
      return 'Partiellement payée';
    } else {
      return 'Non payée';
    }
  }

  getStatutClass(): string {
    if (!this.dette) return '';
    
    if (this.dette.montantRestant === 0) {
      return 'bg-success';
    } else if (this.dette.montantPaye > 0) {
      return 'bg-warning';
    } else {
      return 'bg-danger';
    }
  }

  getPourcentagePaye(): number {
    if (!this.dette) return 0;
    return this.dette.montantDette > 0 ? (this.dette.montantPaye / this.dette.montantDette) * 100 : 0;
  }

  getPourcentagePaiement(paiement: Paiement): number {
    if (!this.dette) return 0;
    return this.dette.montantDette > 0 ? (paiement.montant / this.dette.montantDette) * 100 : 0;
  }

  getCumulPaiements(index: number): number {
    let cumul = 0;
    for (let i = this.paiements.length - 1; i >= index; i--) {
      cumul += this.paiements[i].montant;
    }
    return cumul;
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' CFA';
  }

  getDateDifference(date: string): number {
    const paiementDate = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - paiementDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  recharger(): void {
    this.error = '';
    this.loadDette();
    this.loadPaiements();
  }
}

