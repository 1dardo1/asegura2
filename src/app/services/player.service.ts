import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private players$ = new BehaviorSubject<Player[]>([]);
  private currentPlayerIndex = 0;

  // Crea jugadores iniciales
  initializePlayers(names: string[]): void {
    const players = names.map((name, index) => ({
      id: index + 1,
      name,
      money: 1500,
      salary: 200,
      monthlyFee: 100,
      position: 0,
      insured: [],
      skipNextTurn: false,
      avatarTexture: '' 

    }));
    this.players$.next(players);
  }

  // Obtener jugador actual
  get currentPlayer(): Player {
    return this.players$.value[this.currentPlayerIndex];
  }

  // Avanzar turno
  nextTurn(): void {
    if (this.currentPlayer.skipNextTurn) {
      this.currentPlayer.skipNextTurn = false;
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players$.value.length;
    }
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players$.value.length;
  }

  // Actualizar dinero
  updateMoney(playerId: number, amount: number): void {
    const players = [...this.players$.value];
    const player = players.find(p => p.id === playerId);
    if (player) {
      player.money += amount;
      this.players$.next(players);
    }
  }

  // Comprar propiedad
  buyInsurance(playerId: number, position: number): void {
    const players = [...this.players$.value];
    const player = players.find(p => p.id === playerId);
    if (player && !player.insured.includes(position)) {
      player.insured.push(position);
      this.players$.next(players);
    }
  }

  handleSalaryPayment(playerId: number): void {
    const player = this.players$.value.find(p => p.id === playerId);
    if (player) {
      player.money += player.salary;
      this.players$.next([...this.players$.value]);
    }
  }

  handleMonthlyPayment(playerId: number): void {
    const player = this.players$.value.find(p => p.id === playerId)!;
    if (player && player.money >= player.monthlyFee) {
      player.money -= player.monthlyFee;
      this.players$.next([...this.players$.value]);
    } else {
      player.skipNextTurn = true;
    }
  }
}
