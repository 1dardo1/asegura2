import { Injectable } from '@angular/core';
import { DiceService } from './dice.service';
import { PlayerService } from './player.service';
import { EventoService } from './eventos.service';
import { ModalService } from './modal.service';
import { CasillasService, seguros } from './casillas.service';
import { GameLogicService } from './game-logic.service';
import { GameStateService } from './game-state.service';
import { Player } from '../models/player.model';
import { Subscription, take } from 'rxjs';
import { BoardUiService } from './board-ui.service';

@Injectable({ providedIn: 'root' })
export class BoardInteractionService {
  private scene!: Phaser.Scene;
  private diceSub?: Subscription;
  private isModalOpen = false;
  private modalQueue: (() => void)[] = [];

  constructor(
    private diceService: DiceService,
    private playerService: PlayerService,
    private eventoService: EventoService,
    private modalService: ModalService,
    private casillasService: CasillasService,
    private logic: GameLogicService,
    private state: GameStateService
  ) {}

  init(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Lógica al pulsar el dado: animación, resultado y movimiento.
   * El boardUiService debe pasar sus métodos para manipulación visual.
   */
  handleDicePressed(boardUi: any) {
    boardUi.showDiceRoll();
    this.diceSub?.unsubscribe();
    this.diceService.roll();

    let emissions = 0;
    const maxEmits = 15;
    this.diceSub = this.diceService.result$.subscribe(n => {
      boardUi.updateDiceValue(n);
      emissions++;
      if (emissions === maxEmits) {
        boardUi.showContinuePrompt();
        this.scene.input.once('pointerdown', () => {
          boardUi.hideDiceElements();
          this.moveCurrentPlayer(n, boardUi);
        });
      }
    });
  }

  handleModalAction(action: string, data: any, boardUi: any) {
    // Aquí gestionas las acciones del modal según el tipo
    switch (action) {
      case 'comprar':
        // Lógica para comprar seguro
        // data.player, data.seguro, data.precioSeguro
        // Actualiza el estado del jugador, llama a servicios, etc.
        break;
      case 'cancelar':
        // Lógica para cancelar
        break;
      case 'siguiente':
        // Lógica para avanzar tras evento/sueldo/pago
        break;
      case 'error':
        // Mostrar error, si procede
        boardUi.showErrorModal(data);
        break;
      default:
        break;
    }
  }
  /**
   * Mueve al jugador actual y gestiona efectos de paso y llegada.
   */private async moveCurrentPlayer(steps: number, boardUi: any): Promise<void> {
  if (!boardUi.scene) {
    console.warn('BoardUiService no tiene escena asociada');
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.moveCurrentPlayer(steps, boardUi);
  }

  const players = this.playerService.getCurrentPlayers();
  const currentPlayerIndex = this.state.getCurrentPlayerIndex();
  const player = players[currentPlayerIndex];
  if (!player) return;

  // Animación de movimiento de ficha
  await this.animateTokenMovement(player, steps, boardUi);

  // Actualizar posición
  const newPosition = (player.position + steps) % boardUi.cellPositions.length;
  this.playerService.updatePlayerPosition(player.id, newPosition);

  // Efectos al pasar por casillas
  for (let i = 1; i <= steps; i++) {
    const passingPos = (player.position + i) % boardUi.cellPositions.length;
    this.casillasService.handlePassingPosition(passingPos, player);
  }

  // Manejar efecto de llegada
  const tipoCasilla = this.casillasService.handleBoardPosition(newPosition, player);

  // Gestionar modal solo si es necesario
  if (tipoCasilla !== seguros.EVENTO) {
    this.logic.nextTurn();
    return;
  }

  // Gestionar modal con take(1) para auto-desubscribirse
  this.modalService.seguro$.pipe(take(1)).subscribe({
    next: async ({ player, seguro }) => {
      console.log('[MODAL] Mostrando modal para:', seguro, player.name);
      await this.handleSeguroModal(player, seguro, boardUi);
      this.logic.nextTurn();
    },
    error: (err) => console.error('Error en modal:', err)
  });
}


  /**
   * Animación de movimiento de ficha (idéntica a tu BoardScene actual).
   */
  private async animateTokenMovement(player: Player, steps: number, boardUi: any): Promise<void> {
    const total = boardUi.cellPositions.length;
    const currentPlayerIndex = this.state.getCurrentPlayerIndex();
    const from = player.position;
    const token = boardUi.tokens[currentPlayerIndex];

    for (let i = 1; i <= steps; i++) {
      const nextIndex = (from + i) % total;
      const pos = boardUi.cellPositions[nextIndex];
      await new Promise<void>(res => {
        this.scene.tweens.add({
          targets: token,
          x: pos.x, y: pos.y,
          duration: 200,
          ease: 'Linear',
          onComplete: () => res()
        });
      });
    }
  }

  /**
   * Lógica para mostrar y gestionar el modal de seguro/evento.
   */
  private async handleSeguroModal(player: Player, seguro: seguros, boardUi: BoardUiService) {
    await boardUi.showInsuranceModal(player, seguro);

    return new Promise<void>(resolve => {
      boardUi.onModalAction = (action) => {
        if (action === 'siguiente') resolve();
      };
    });
  }

  /**
   * Limpieza de suscripciones y recursos.
   */
  shutdown() {
    this.diceSub?.unsubscribe();
  }
}
