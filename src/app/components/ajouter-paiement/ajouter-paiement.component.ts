import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dette } from '../../shared/models/dette';
import { Client } from '../../shared/models/client';
import { Paiement } from '../../shared/models/paiement';
import { DetteService } from '../../shared/services/dette.service';
import { ClientService } from '../../shared/services/client.service';
import { PaiementService } from '../../shared/services/paiement.service';

@Component({
  selector: 'app-ajouter-paiement',
  templateUrl: './ajouter-paiement.component.html',
  styleUrls: ['./ajouter-paiement.component.css']
})
export class AjouterPaiementComponent implements OnInit {
  paiementForm: FormGroup;
  dette: Dette | null = null;
  client: Client | null = null;
  detteId: number;
  loading = false;
  error = '';
  success = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private detteService: DetteService,
    private clientService: ClientService,
    private paiementService: PaiementService
  ) {
    this.detteId = Number(this.route.snapshot.paramMap.get('detteId'));
    
    this.paiementForm = this.fb.group({
      date: [new Date().toISOString().substring(0, 10), [Validators.required]],
      montant: ['', [Validators.required, Validators.min(1)]],
      description: ['', [Validators.maxLength(300)]]
    });
  }

  ngOnInit(): void {
    this.loadDette();
  }

  loadDette(): void {
    this.detteService.getDetteById(this.detteId).subscribe({
      next: (dette) => {
        this.dette = dette;
        // Mettre à jour les validateurs avec le montant maximum
        this.paiementForm.get('montant')?.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(dette.montantRestant),
          Validators.pattern(/^\d+$/)
        ]);
        this.paiementForm.get('montant')?.updateValueAndValidity();
        
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

  onSubmit(): void {
    if (this.paiementForm.valid && this.dette) {
      this.loading = true;
      this.error = '';

      const paiement: Paiement = {
        date: this.paiementForm.value.date,
        montant: Number(this.paiementForm.value.montant),
        detteId: this.detteId
      };

      this.paiementService.addPaiement(paiement).subscribe({
        next: (nouveauPaiement) => {
          this.success = true;
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/dettes/client', this.dette!.clientId]);
          }, 2000);
        },
        error: (err) => {
          this.error = 'Erreur lors de l\'ajout du paiement';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.paiementForm.controls).forEach(key => {
      const control = this.paiementForm.get(key);
      control?.markAsTouched();
    });
  }

  annuler(): void {
    if (this.dette) {
      this.router.navigate(['/dettes/client', this.dette.clientId]);
    }
  }

  // Getters pour les contrôles
  get date() { return this.paiementForm.get('date'); }
  get montant() { return this.paiementForm.get('montant'); }
  get description() { return this.paiementForm.get('description'); }

  // Méthodes utilitaires
  formatCurrency(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' CFA';
  }

  getPourcentageActuel(): number {
    if (!this.dette) return 0;
    return this.dette.montantDette > 0 ? (this.dette.montantPaye / this.dette.montantDette) * 100 : 0;
  }

  getPourcentageApres(): number {
    if (!this.dette || !this.montant?.value) return this.getPourcentageActuel();
    const nouveauMontantPaye = this.dette.montantPaye + Number(this.montant.value);
    return this.dette.montantDette > 0 ? (nouveauMontantPaye / this.dette.montantDette) * 100 : 0;
  }

  getNouveauRestant(): number {
    if (!this.dette || !this.montant?.value) return this.dette?.montantRestant || 0;
    return this.dette.montantRestant - Number(this.montant.value);
  }

  isDetteSeraVSoldee(): boolean {
    return this.getNouveauRestant() === 0;
  }
}
