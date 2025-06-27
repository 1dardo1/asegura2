import { Injectable } from '@angular/core';
import { GameStateService } from './game-state.service';
import { PlayerService } from './player.service';
import { EventoService } from './eventos.service';
import { CasillasService, seguros } from './casillas.service';
import { Player } from '../models/player.model';
import { Evento } from '../models/evento.model';

@Injectable({ providedIn: 'root' })
export class GameLogicService {
  constructor(
    private state: GameStateService,
    private playerService: PlayerService,
    private eventoService: EventoService,
    private casillasService: CasillasService
  ) {}

  /**
   * Mueve al jugador actual una cantidad de posiciones y gestiona los efectos de paso y llegada.
   * @param steps Número de posiciones a mover (puede ser negativo)
   */
  moveCurrentPlayer(steps: number): void {
    const players = this.state.getPlayers();
    const currentIndex = this.state.getCurrentPlayerIndex();
    if (players.length === 0 || currentIndex < 0 || currentIndex >= players.length) return;

    const player = { ...players[currentIndex] };
    const oldPosition = player.position;
    let newPosition = (player.position + steps) % 22;
    if (newPosition < 0) newPosition += 22;

    // Efecto al pasar por casillas especiales
    for (let i = 1; i <= Math.abs(steps); i++) {
      const pos = (oldPosition + (steps > 0 ? i : -i) + 22) % 22;
      this.casillasService.handlePassingPosition(pos, player);
    }

    // Actualizar posición
    player.position = newPosition;
    this.playerService.updatePlayerPosition(player.id, newPosition);

    // Efecto al caer en la nueva casilla
    const tipoCasilla = this.casillasService.handleBoardPosition(newPosition, player);

    // Si la casilla es de evento, aplicar evento aleatorio
    if (tipoCasilla === seguros.EVENTO) {
      const evento = this.eventoService.getEventoAleatorio();
      if (evento) this.applyEvent(evento, player);
    }
  }

  /**
   * Aplica un evento a un jugador (por defecto al jugador actual).
   * @param evento Evento a aplicar
   * @param player Jugador objetivo (opcional, por defecto el actual)
   */
  applyEvent(evento: Evento, player?: Player): void {
    const target = player || this.state.getCurrentPlayer();
    if (!target) return;
    this.eventoService.aplicarEvento(evento, target);
  }

  /**
   * Avanza el turno al siguiente jugador.
   */
  nextTurn(): void {
    const players = this.state.getPlayers();
    if (players.length === 0) return;
    let nextIndex = (this.state.getCurrentPlayerIndex() + 1) % players.length;
    this.state.updateCurrentPlayerIndex(nextIndex);
  }
}
