import { Injectable } from '@angular/core';
import { Player } from '../models/player.model';
import { PlayerService } from './player.service';
import { ModalService } from './modal.service';


export enum seguros {
    SALUD = "SALUD",
    VIDA = "VIDA",
    COCHE = "COCHE",
    VIAJE = "VIAJE",
    HOGAR = "HOGAR",
    RESPONSABILIDAD_CIVIL = "RESPONSABILIDAD_CIVIL",
    CAJA_AHORROS = "CAJA_AHORROS",
    EVENTO = "EVENTO",
    PAGO_MENSUAL="PAGO_MENSUAL",
    SUELDO="SUELDO"

}

/**
 * Servicio para gestionar las acciones asociadas a las casillas del tablero.
 * - Aplica efectos al pasar o caer en una casilla concreta.
 */
@Injectable({ providedIn: 'root' })
export class CasillasService {
  // ======== Inicializaciones e inyección de dependencias ========
  constructor(private playerService: PlayerService, private modalService: ModalService) {}

  // ======== Métodos principales ========

  /**
   * Aplica efectos al pasar por ciertas posiciones del tablero.
   * @param position Índice de la casilla
   * @param player Jugador que pasa por la casilla
   */
  handlePassingPosition(position: number, player: Player): void {
    // Solo aplicamos efectos en estas casillas al pasar por ellas
    switch (position) {
      case 11: // Casilla de Sueldo
        console.log(`${player.name} pasa por SALIDA`);   
        this.modalService.solicitarSeguro(player, seguros.SUELDO);
   
        break;
      case 0: // Casilla de Alquiler
        console.log(`${player.name} pasa por ALQUILER`);
        this.modalService.solicitarSeguro(player, seguros.PAGO_MENSUAL);
        break;
    }
  }

  /**
   * Ejecuta la acción asociada a cada casilla del tablero al caer en ella.
   * @param position Índice de la casilla
   * @param player Jugador que cae en la casilla
   */
handleBoardPosition(position: number, player: Player): seguros {
  switch (position) {
    case 0: 
    case 11: 
      return seguros.EVENTO; // Casillas sin seguro específico
    
    case 1:
    case 12: 
      this.modalService.solicitarSeguro(player, seguros.SALUD);
      return seguros.SALUD;
    
    case 3:
    case 14:
      this.modalService.solicitarSeguro(player, seguros.VIDA);
      return seguros.VIDA;
    
    case 4:
    case 15:
      this.modalService.solicitarSeguro(player, seguros.COCHE);
      return seguros.COCHE;
    
    case 6:
    case 17:
      this.modalService.solicitarSeguro(player, seguros.VIAJE);
      return seguros.VIAJE;
    
    case 8:
    case 19:
      this.modalService.solicitarSeguro(player, seguros.HOGAR);
      return seguros.HOGAR;
    
    case 9:
    case 20:
      this.modalService.solicitarSeguro(player, seguros.RESPONSABILIDAD_CIVIL);
      return seguros.RESPONSABILIDAD_CIVIL;
    
    case 10:
    case 21:
      this.modalService.solicitarSeguro(player, seguros.CAJA_AHORROS);
      return seguros.CAJA_AHORROS;
    
    // Casillas de eventos
    case 2:
    case 5:
    case 7:
    case 13:
    case 16:
    case 18:
    case 22:
      this.modalService.solicitarSeguro(player, seguros.EVENTO);
      return seguros.EVENTO;
    
    default:
      console.log(`${player.name} en casilla ${position} (sin acción especial)`);
      return seguros.EVENTO; // Valor por defecto
  }
}
  // ======== Métodos de limpieza/eliminación ========
  // (No existen en este servicio actualmente, pero aquí irían si fueran necesarios)
}
