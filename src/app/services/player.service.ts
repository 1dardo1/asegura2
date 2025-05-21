import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../models/player.model';

/**
 * Servicio para gestionar:
 * - Estado de los jugadores
 * - Turnos del juego
 * - Transacciones económicas básicas
 */
@Injectable({ providedIn: 'root' })
export class PlayerService {
  /** Almacena y emite el estado actual de todos los jugadores */
  private players$ = new BehaviorSubject<Player[]>([]);
  
  /** Índice del jugador actual en el array */
  private currentPlayerIndex = 0;

  /**
   * Inicializa los jugadores con valores por defecto
   * @param names Nombres de los jugadores (ej: ['Jugador 1', 'Jugador 2'])
   */
  initializePlayers(names: string[]): void {
    const players = names.map((name, index) => ({
      id: index + 1,
      name,
      money: 1500,       // Dinero inicial
      salary: 200,       // Salario por vuelta completa
      monthlyFee: 100,   // Cuota mensual (no usado en la versión actual)
      position: 0,       // Casilla inicial
      insured: [],       // Propiedades aseguradas (no usado en la versión actual)
      skipNextTurn: false, // Control de turnos perdidos
      avatarTexture: ''  // Textura para el sprite (no implementado)
    }));
    this.players$.next(players);
  }

  /** Obtiene el jugador actual */
  get currentPlayer(): Player {
    return this.players$.value[this.currentPlayerIndex];
  }

  /**
   * Avanza al siguiente turno, aplicando lógica de turnos perdidos
   */
  nextTurn(): void {
    if (this.currentPlayer.skipNextTurn) {
      this.currentPlayer.skipNextTurn = false;
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players$.value.length;
    }
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players$.value.length;
  }

  /**
   * Maneja el pago del salario cuando un jugador pasa por la salida
   * @param playerId ID del jugador que recibe el salario
   */
  handleSalaryPayment(playerId: number): void {
    const player = this.players$.value.find(p => p.id === playerId);
    if (player) {
      player.money += player.salary;
      this.players$.next([...this.players$.value]);
    }
  }
}
