import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Player } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  // ======== Estado Centralizado ========
  private _players = new BehaviorSubject<Player[]>([]);
  private _currentPlayerIndex = new BehaviorSubject<number>(0);

  // ======== Observables Públicos ========
  players$ = this._players.asObservable();
  currentPlayerIndex$ = this._currentPlayerIndex.asObservable();
  
  // Combinación para obtener jugador actual reactivamente
  currentPlayer$: Observable<Player | null> = combineLatest([
    this.players$,
    this.currentPlayerIndex$
  ]).pipe(
    map(([players, index]) => {
      return players.length > 0 && index < players.length 
        ? players[index] 
        : null;
    }),
    distinctUntilChanged()
  );

  // ======== Métodos de Actualización ========
  updatePlayers(players: Player[]): void {
    this._players.next([...players]);
  }

  updateCurrentPlayerIndex(index: number): void {
    if (index >= 0 && index < this._players.value.length) {
      this._currentPlayerIndex.next(index);
    }
  }

  // ======== Métodos de Acceso Síncrono ========
  getPlayers(): Player[] {
    return [...this._players.value];
  }

  getCurrentPlayerIndex(): number {
    return this._currentPlayerIndex.value;
  }

  getCurrentPlayer(): Player | null {
    const players = this._players.value;
    const index = this._currentPlayerIndex.value;
    return players.length > 0 && index < players.length 
      ? players[index] 
      : null;
  }

  getPlayersSnapshot(): Player[] {
  return this._players.value;
}
}
