import { Injectable } from '@angular/core';
import { Player } from '../models/player.model';
import { PlayerService } from './player.service';

@Injectable({ providedIn: 'root' })
export class CasillasService {
  constructor(private playerService: PlayerService) {}

    handlePassingPosition(position: number, player: Player): void {
        // Solo aplicamos efectos en estas casillas al pasar por ellas
        switch(position) {
        case 11: // Casilla de Sueldo
            console.log(`${player.name} pasa por SALIDA`);
            this.playerService.handleSalaryPayment(player.id);
            break;
        case 0: // Casilla de Alquiler
            console.log(`${player.name} pasa por ALQUILER`);
            // Aquí iría la lógica de cobrar alquiler
            break;
        }
    }

  /**
   * Ejecuta la acción asociada a cada casilla del tablero
   */
  handleBoardPosition(position: number, player: Player): void {
    switch (position) {
        case 0: // Pago de alquiler
        case 11: // Casilla inicial (Sueldo)
            break;
        case 1:
        case 12: // Seguro de salud
            console.log(`${player.name} en Seguro de Salud`);
            break;
        case 3:
        case 14: // Seguro de vida
            console.log(`${player.name} en Seguro de Vida`);
            break;
        case 4:
        case 15: // Seguro de coche
            console.log(`${player.name} en Seguro de Coche`);
            break;
        case 6:
        case 17: // Seguro de viaje
            console.log(`${player.name} en Seguro de Viaje`);
            break;
        case 8:
        case 19: // Seguro de hogar
            console.log(`${player.name} en Seguro de Hogar`);
            break;
        case 9:
        case 20: // Seguro responsabilidad civil
            console.log(`${player.name} en Seguro Resposabilidad Civil`);
            break;
        case 10:
        case 21: // Caja de ahorros
            console.log(`${player.name} en Caja de Ahorros`);
            break;

        // Casillas genéricas
        case 2:
        case 5:
        case 7:
        case 13:
        case 16:
        case 18:
        case 22:
            console.log(`${player.name} activa evento aleatorio`);
            break;

        default:
            console.log(`${player.name} en casilla ${position} (sin acción especial)`);
        }
  }
}
