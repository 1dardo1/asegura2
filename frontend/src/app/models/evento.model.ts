
export enum TipoSeguro {
    SALUD = "SALUD",
    VIDA = "VIDA",
    COCHE = "COCHE",
    VIAJE = "VIAJE",
    HOGAR = "HOGAR",
    RESPONSABILIDAD_CIVIL = "RESPONSABILIDAD_CIVIL",
    CAJA_AHORROS = "CAJA_AHORROS",
    EVENTO = "EVENTO",
}

export type VariableModificable = 'money' | 'salary' | 'rent';

export interface Evento {
  tipo: TipoSeguro;               // Tipo de seguro o 'EVENTO'
  texto: string;                  // Descripción del evento
  cantidad: number;               // Valor a sumar/restar (ej: -200)
  variable: VariableModificable;  // Qué variable afecta
  descuento?: 0.5 | 1;            // 0.5 (50%) o 1 (100%) si tiene el seguro
}
