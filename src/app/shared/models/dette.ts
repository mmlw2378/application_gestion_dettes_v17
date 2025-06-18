import { Client } from './client';

export interface Dette {
  id?: number;
  date: string;
  montantDette: number;
  montantPaye: number;
  montantRestant: number;
  clientId: number;
  client?: Client;
}