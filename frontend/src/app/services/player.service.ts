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
  // ======== Inicializaciones ========
  /** Almacena y emite el estado actual de todos los jugadores (privado) */
  public playersSubject = new BehaviorSubject<Player[]>([]);
  /** Observable público para suscribirse a cambios de jugadores */
  public players$ = this.playersSubject.asObservable();
  /** Índice del jugador actual en el array */
  public currentPlayerIndex = 0;

  // ======== Constructor ========
  constructor() {
    this.loadPlayersFromStorage();
    // Guarda automáticamente en localStorage cada vez que cambian los jugadores
    this.playersSubject.subscribe(players => {
      localStorage.setItem('players', JSON.stringify(players));
    });
  }

  // ======== Métodos de inicialización y carga ========
  /** Carga los jugadores guardados desde localStorage (si existen) */
  private loadPlayersFromStorage(): void {
    const saved = localStorage.getItem('players');
    if (saved) {
      try {
        const players = JSON.parse(saved);
        this.playersSubject.next(players);
      } catch (error) {
        console.error('Error al cargar jugadores:', error);
      }
    }
  }

  /**
   * Inicializa los jugadores con valores por defecto
   * @param names Nombres de los jugadores (ej: ['Jugador 1', 'Jugador 2'])
   */
  initializePlayers(names: string[]): void {
    if (!this.playersSubject.value.length) {
      const players = names.map((name, index) => ({
        id: index + 1,
        name,
        money: 1000, // Dinero inicial
        salary: 500, // Salario por vuelta completa
        rent: 100, // Cuota mensual (no usado en la versión actual)
        position: 11, // Casilla inicial
        insured: [], // Propiedades aseguradas (no usado en la versión actual)
        skipNextTurn: false, // Control de turnos perdidos
      }));
      this.playersSubject.next(players);
    }
  }

  // ======== Métodos de acceso y lógica ========
  /** Devuelve el array actual de jugadores */
  getCurrentPlayers(): Player[] {
    return this.playersSubject.value;
  }

  /** Obtiene el jugador actual */
  get currentPlayer(): Player {
    return this.playersSubject.value[this.currentPlayerIndex];
  }

  /**
   * Actualiza la posición de un jugador
   * @param playerId ID del jugador
   * @param newPosition Nueva posición
   */
  updatePlayerPosition(playerId: number, newPosition: number): void {
    const players = this.playersSubject.value;
    const idx = players.findIndex(p => p.id === playerId);
    if (idx !== -1) {
      const updatedPlayer = { ...players[idx], position: newPosition };
      const updatedPlayers = [...players];
      updatedPlayers[idx] = updatedPlayer;
      this.playersSubject.next(updatedPlayers); // Esto guarda en localStorage
    }
  }
  // player.service.ts
  updatePlayer(updatedPlayer: Player): void {
    const players = this.playersSubject.value;
    const idx = players.findIndex(p => p.id === updatedPlayer.id);
    if (idx !== -1) {
      const updatedPlayers = [...players];
      updatedPlayers[idx] = { ...updatedPlayer };
      this.playersSubject.next(updatedPlayers); // Esto guarda en localStorage automáticamente
    }
  }


  /**
   * Avanza al siguiente turno, aplicando lógica de turnos perdidos
   */
  nextTurn(): void {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playersSubject.value.length;
    console.log(this.currentPlayer)
    if (this.currentPlayer.skipNextTurn) {
      this.currentPlayer.skipNextTurn = false;
      console.log("player.skipNextTurn = false;")
      this.updatePlayer(this.currentPlayer);
      this.nextTurn();
    }
  }

  // ======== Métodos de limpieza/eliminación ========
  /** Borra el estado de la partida */
  resetGame(): void {
    localStorage.removeItem('players');
    this.playersSubject.next([]);
    this.currentPlayerIndex = 0;
  }
}
