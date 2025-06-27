// src/app/phaser/board.scene.ts
import Phaser from 'phaser';
import { BoardUiService } from '../services/board-ui.service';
import { BoardInteractionService } from '../services/board-interaction.service';
import { Player } from '../models/player.model';

export class BoardScene extends Phaser.Scene {
  private boardUi!: BoardUiService;
  private boardInteraction!: BoardInteractionService;
  private players: Player[] = [];
  private playerCardObjects: Phaser.GameObjects.GameObject[] = [];
  private tokens: Phaser.GameObjects.Image[] = [];

  constructor(
    boardUi: BoardUiService,
    boardInteraction: BoardInteractionService
  ) {
    super({ key: 'BoardScene' });
    this.boardUi = boardUi;
    this.boardInteraction = boardInteraction;
  }

  preload(): void {
    // Carga todos los assets gráficos necesarios
    this.load.image('tablero', 'assets/images/tablero.png');
    this.load.image('ficha1', 'assets/fichas/JNaranja.png');
    this.load.image('ficha2', 'assets/fichas/JRosaOscuro.png');
    this.load.image('ficha3', 'assets/fichas/JRosaClaro.png');
    this.load.image('ficha4', 'assets/fichas/JMorado.png');
    this.load.image('ficha5', 'assets/fichas/JAzulOscuro.png');
    this.load.image('ficha6', 'assets/fichas/JAzulClaro.png');
    this.load.image('ficha7', 'assets/fichas/JVerde.png');
    this.load.image('ficha8', 'assets/fichas/JAmarillo.png');
    this.load.image('salud', 'assets/images/pastilla.png');
    this.load.image('vida', 'assets/images/corazon.png');
    this.load.image('coche', 'assets/images/coche.png');
    this.load.image('viaje', 'assets/images/avion.png');
    this.load.image('hogar', 'assets/images/casa.png');
    this.load.image('responsabilidad_civil', 'assets/images/escudo.png');
    this.load.image('caja_ahorros', 'assets/images/moneda.png');
    this.load.image('evento', 'assets/images/interrogacion.png');
    this.load.image('dado', 'assets/images/dado.png');
  }

  create(): void {
    console.log('[SCENE] BoardScene creada');

    // Inicialización de servicios de UI e interacción
    this.boardUi.init(this);
    this.boardInteraction.init(this);
    console.log('[SCENE] BoardScene creada 1');

    // Callback para interacción con el dado
    this.boardUi.onDicePressed = () => {
      this.boardInteraction.handleDicePressed(this.boardUi);
    };
    console.log('[SCENE] BoardScene creada 2');

    // Callback para acciones en modales
    this.boardUi.onModalAction = (action, data) => {
      this.boardInteraction.handleModalAction(action, data, this.boardUi);
    };
    console.log('[SCENE] BoardScene creada 3');

    // Inicializa la UI de los jugadores (tarjetas y fichas)
    if (this.players.length > 0) {
      this.boardUi.updatePlayerCards(this.players);
      this.boardUi.createTokens(this.players);
    }
    console.log('[SCENE] BoardScene creada fin');
  }

  /**
   * Método público para actualizar la lista de jugadores y refrescar la UI.
   * Llamado desde GameComponent cuando cambia el estado.
   */
  updatePlayers(players: Player[]): void {
    console.log('[SCENE] updatePlayers llamado con', players.length, 'jugadores');

    if (!this.boardUi) {
      console.warn("BoardUiService no inicializado. Ignorando actualización.");
      return;
    }
    this.players = players;
    this.boardUi.updatePlayerCards(players);
    this.boardUi.createTokens(players);
  }

  /**
   * Limpieza de recursos y suscripciones.
   */
  shutdown(): void {
    this.boardInteraction.shutdown();
    this.playerCardObjects.forEach((obj: Phaser.GameObjects.GameObject) => {
      obj.destroy();
    });
    
    this.tokens.forEach((token: Phaser.GameObjects.Image) => {
      token.destroy();
    });
  }
}
