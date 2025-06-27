import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  // ======== Inicializaciones ========
  public playersSubject = new BehaviorSubject<Player[]>([]);
  public players$ = this.playersSubject.asObservable();
  public currentPlayerIndex = 0;

  // ======== Constructor ========
  constructor(private http: HttpClient) {
  }

  // ======== Métodos de carga ========
  private loadPlayersFromBackend(): void {
    this.http.get<Player[]>('/api/players').subscribe({
      next: (players) => {
        if (players && players.length > 0) {
          this.playersSubject.next(players);
          console.log('Jugadores cargados desde MongoDB:', players.length);
        } 
      },
      error: (error) => {
        console.error('Error al cargar jugadores desde backend:', error);
      }
    });
  }



  private savePlayersToBackend(players: Player[]): void {
    this.http.post('/api/players', players).subscribe({
      next: () => {
        console.log('Jugadores guardados en MongoDB exitosamente');
      },
      error: (error) => {
        console.error('Error al guardar jugadores en MongoDB:', error);
      }
    });
  }

  // ======== Métodos de inicialización ========
  initializePlayers(names: string[]): void {
    console.log('🔧 Inicializando jugadores:', names);
    
    // Solo crear si no existen jugadores
    if (!this.playersSubject.value.length) {
      const players = names.map((name, index) => ({
        id: index + 1,
        name,
<<<<<<< HEAD
        money: 1000, // Dinero inicial
        salary: 500, // Salario por vuelta completa
        rent: 100, // Cuota mensual (no usado en la versión actual)
        position: 11, // Casilla inicial
        insured: [], // Propiedades aseguradas (no usado en la versión actual)
        skipNextTurn: false, // Control de turnos perdidos
=======
        money: 1000,
        salary: 400,
        rent: 100,
        position: 11,
        insured: [],
        skipNextTurn: false,
>>>>>>> playersBD
      }));
      
      // Actualizar el BehaviorSubject primero
      this.playersSubject.next(players);
      console.log('✅ Jugadores creados en memoria');
      
      // Guardar en MongoDB
      this.savePlayersToBackend(players);
    } else {
      console.log('⚠️ Jugadores ya existen, no se crean nuevos');
    }
  }


  // ======== Métodos de acceso ========
  getCurrentPlayers(): Player[] {
    return this.playersSubject.value;
  }

  get currentPlayer(): Player | null {
    const players = this.playersSubject.value;
    if (!players || players.length === 0 || this.currentPlayerIndex >= players.length) {
      return null;
    }
    return players[this.currentPlayerIndex];
  }


  // ======== Métodos de actualización ========
  updatePlayerPosition(playerId: number, newPosition: number): void {
    const players = this.playersSubject.value;
    const idx = players.findIndex(p => p.id === playerId);
    if (idx !== -1) {
      const updatedPlayer = { ...players[idx], position: newPosition };
      const updatedPlayers = [...players];
      updatedPlayers[idx] = updatedPlayer;
      this.playersSubject.next(updatedPlayers);
      
      // Usar PATCH para actualizar solo la posición
      this.http.patch(`/api/players/${playerId}/position`, { position: newPosition }).subscribe({
        error: (error) => {
          console.error('Error al actualizar posición en MongoDB:', error);
        }
      });
    }
  }

  updatePlayer(updatedPlayer: Player): void {
    const players = this.playersSubject.value;
    const idx = players.findIndex(p => p.id === updatedPlayer.id);
    if (idx !== -1) {
      const updatedPlayers = [...players];
      updatedPlayers[idx] = { ...updatedPlayer };
      this.playersSubject.next(updatedPlayers);
  
      // Elimina _id antes de enviar al backend
      const playerToSend = { ...updatedPlayer } as any;
      if (playerToSend._id) {
        delete playerToSend._id;
      }
  
      this.http.put(`/api/players/${updatedPlayer.id}`, playerToSend).subscribe({
        error: (error) => {
          console.error('Error al actualizar jugador en MongoDB:', error);
          localStorage.setItem('players', JSON.stringify(updatedPlayers));
        }
      });
    }
  }
  

  // ======== Métodos de turno ========
  nextTurn(): void {
    const players = this.playersSubject.value;
    
    // Validar que existan jugadores antes de proceder
    if (!players || players.length === 0) {
      console.warn('No hay jugadores disponibles para el siguiente turno');
      return;
    }
    
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % players.length;
    const currentPlayer = players[this.currentPlayerIndex];
    
    // Validar que el jugador actual existe
    if (!currentPlayer) {
      console.error('Jugador actual no encontrado');
      return;
    }
    
    console.log(currentPlayer);
    
    if (currentPlayer.skipNextTurn) {
      currentPlayer.skipNextTurn = false;
      console.log("player.skipNextTurn = false;");
      this.updatePlayer(currentPlayer);
      this.nextTurn();
    }
  }


  // ======== Métodos de limpieza ========
  resetGame(): void {
    this.http.delete('/api/players').subscribe({
      next: () => {
        console.log('Jugadores eliminados de MongoDB');
        this.playersSubject.next([]);
        this.currentPlayerIndex = 0;
      },
      error: (error) => {
        console.error('Error al eliminar jugadores de MongoDB:', error);
        this.playersSubject.next([]);
        this.currentPlayerIndex = 0;
      }
    });
  }

  reloadPlayersFromBackend(): void {
    this.loadPlayersFromBackend();
  }
}
