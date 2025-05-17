// src/app/services/player.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private players: Player[] = [];
  private players$ = new BehaviorSubject<Player[]>([]);
  private currentPlayerIndex = 0;

  /** Observable para UI */
  getPlayers$() {
    return this.players$.asObservable();
  }

  /** Índice de jugador activo */
  getCurrentPlayer() {
    return this.currentPlayerIndex;
  }

  /** 1) Inicializa jugadores */
  initPlayers(configs: {
    name: string;
    salary: number;
    monthlyFee: number;
  }[]) {
    this.players = configs.map((cfg, idx) => ({
      id: idx,
      name: cfg.name,
      money: 1500,
      salary: cfg.salary,
      monthlyFee: cfg.monthlyFee,
      position: 11,
      insured: [],
      skipNextTurn: false
    }));
    this.players$.next(this.players);
  }

  /** 2) Mover jugador y cobrar salario si cruza salida */
  movePlayer(id: number, steps: number, totalCells: number) {
    const p = this.players[id];
    const oldPos = p.position;
    const newPos = (oldPos + steps) % totalCells;
    if (oldPos + steps >= totalCells) {
      p.money += p.salary;
    }
    p.position = newPos;
    this.players$.next(this.players);
  }

  /** 3) Cobrar mensualidad y bloquear si fondos insuficientes */
  applyMonthlyFee(id: number, feeCellIndex: number) {
    const p = this.players[id];
    if (p.position === feeCellIndex) {
      if (p.money >= p.monthlyFee) {
        p.money -= p.monthlyFee;
      } else {
        p.skipNextTurn = true;
      }
      this.players$.next(this.players);
    }
  }

  /** 4) Comprar seguro si puede */
  buyInsurance(id: number, cellIndex: number, cost: number) {
    const p = this.players[id];
    if (!p.insured.includes(cellIndex) && p.money >= cost) {
      p.money -= cost;
      p.insured.push(cellIndex);
      this.players$.next(this.players);
    }
  }

  /** 5) Pasar al siguiente jugador, saltando si está bloqueado */
  nextPlayerTurn() {
    let next = (this.currentPlayerIndex + 1) % this.players.length;
    if (this.players[next].skipNextTurn) {
      this.players[next].skipNextTurn = false;
      this.players$.next(this.players);
      next = (next + 1) % this.players.length;
    }
    this.currentPlayerIndex = next;
  }
}
