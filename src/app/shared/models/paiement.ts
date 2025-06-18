import { Dette } from './dette';

export interface Paiement {
  id?: number;
  montant: number;
  date: string;
  detteId: number;
  dette?: Dette;
}