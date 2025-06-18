import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Composants
import { ClientListComponent } from './components/client-list/client-list.component';
import { DettesClientComponent } from './components/dettes-client/dettes-client.component';
import { AjouterDetteComponent } from './components/ajouter-dette/ajouter-dette.component';
import { AjouterPaiementComponent } from './components/ajouter-paiement/ajouter-paiement.component';
import { PaiementsDetteComponent } from './components/paiements-dette/paiements-dette.component';

@NgModule({
  declarations: [
    AppComponent,
    ClientListComponent,
    DettesClientComponent,
    AjouterDetteComponent,
    AjouterPaiementComponent,
    PaiementsDetteComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }