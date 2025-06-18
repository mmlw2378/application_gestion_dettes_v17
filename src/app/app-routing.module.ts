import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientListComponent } from './components/client-list/client-list.component';
import { DettesClientComponent } from './components/dettes-client/dettes-client.component';
import { AjouterDetteComponent } from './components/ajouter-dette/ajouter-dette.component';
import { AjouterPaiementComponent } from './components/ajouter-paiement/ajouter-paiement.component';
import { PaiementsDetteComponent } from './components/paiements-dette/paiements-dette.component';

const routes: Routes = [
  { path: '', redirectTo: '/clients', pathMatch: 'full' },
  { path: 'clients', component: ClientListComponent },
  { path: 'dettes/client/:clientId', component: DettesClientComponent },
  { path: 'dettes/ajouter/:clientId', component: AjouterDetteComponent },
  { path: 'paiements/dette/:detteId', component: PaiementsDetteComponent },
  { path: 'paiements/ajouter/:detteId', component: AjouterPaiementComponent },
  { path: '**', redirectTo: '/clients' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }