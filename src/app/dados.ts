import bruto from '@dados';
import type { DadosPerfil } from '../dominio/visoes';

// O JSON foi gerado por scripts/gerar.ts a partir das projeções tipadas,
// então a forma é conhecida; aqui só recuperamos o tipo.
export const dados = bruto as DadosPerfil;
