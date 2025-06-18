import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dette } from '../../shared/models/dette';
import { Client } from '../../shared/models/client';
import { DetteService } from '../../shared/services/dette.service';
import { ClientService } from '../../shared/services/client.service';

@Component({
  selector: 'app-ajouter-dette',
  templateUrl: './ajouter-dette.component.html',
  styleUrls: ['./ajouter-dette.component.css']
})
export class AjouterDetteComponent implements OnInit {
  detteForm: FormGroup;
  client: Client | null = null;
  clientId: number;
  loading = false;
  error = '';
  success = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private detteService: DetteService,
    private clientService: ClientService
  ) {
    this.clientId = Number(this.route.snapshot.paramMap.get('clientId'));
    
    // Formulaire réactif avec validation
    this.detteForm = this.fb.group({
      date: [new Date().toISOString().substring(0, 10), [Validators.required]],
      montantDette: [
        '', 
        [
          Validators.required, 
          Validators.min(1000), 
          Validators.max(10000000),
          Validators.pattern(/^\d+$/)
        ]
      ],
      description: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadClient();
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

  onSubmit(): void {
    if (this.detteForm.valid) {
      this.loading = true;
      this.error = '';

      const dette: Dette = {
        date: this.detteForm.value.date,
        montantDette: Number(this.detteForm.value.montantDette),
        montantPaye: 0,
        montantRestant: Number(this.detteForm.value.montantDette),
        clientId: this.clientId
      };

      this.detteService.addDette(dette).subscribe({
        next: (nouvelleDette) => {
          this.success = true;
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/dettes/client', this.clientId]);
          }, 2000);
        },
        error: (err) => {
          this.error = 'Erreur lors de l\'ajout de la dette';
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.detteForm.controls).forEach(key => {
      const control = this.detteForm.get(key);
      control?.markAsTouched();
    });
  }

  annuler(): void {
    this.router.navigate(['/dettes/client', this.clientId]);
  }

  // Getters pour faciliter l'accès aux contrôles
  get date() { return this.detteForm.get('date'); }
  get montantDette() { return this.detteForm.get('montantDette'); }
  get description() { return this.detteForm.get('description'); }

  // Méthodes utilitaires
  formatCurrency(amount: number): string {
    return amount.toLocaleString('fr-FR') + ' CFA';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('fr-FR');
  }
}

