export interface Player {
    id: number;               // índice único del jugador
    name: string;             // nombre para mostrar
    money: number;            // saldo actual
    salary: number;           // lo que cobra al pasar por salida
    monthlyFee: number;       // lo que paga al pasar por casilla de mensualidad
    position: number;         // índice de casilla actual
    insured: string[];       // array de índices de casillas que compró
    skipNextTurn?: boolean;   // flag para indicar que pierde el siguiente turno por no pagar mensualidad
  }
  