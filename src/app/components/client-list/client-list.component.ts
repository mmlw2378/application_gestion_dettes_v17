import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Client } from '../../shared/models/client';
import { ClientService } from '../../shared/services/client.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  loading = false;
  error = '';
getCurrentTime: any;

  constructor(
    private clientService: ClientService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des clients';
        this.loading = false;
        console.error(err);
      }
    });
  }

  voirDettes(clientId: number): void {
    this.router.navigate(['/dettes/client', clientId]);
  }

  ajouterDette(clientId: number): void {
    this.router.navigate(['/dettes/ajouter', clientId]);
  }

  recharger(): void {
    this.error = '';
    this.loadClients();
  }
}