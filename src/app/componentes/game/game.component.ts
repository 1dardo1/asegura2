import { CommonModule } from '@angular/common';
import { Player } from '../../models/player.model';

import {
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
import Phaser from 'phaser';
import { DiceService } from '../../services/dice.service';
import { PlayerService } from '../../services/player.service';
import { CasillasService } from '../../services/casillas.service'; 

/**
 * Componente principal del juego.
 * Renderiza el contenedor de Phaser y gestiona la lógica de jugadores y eventos.
 */
@Component({
  standalone: true,
  selector: 'app-game',
  template: '<div #gameContainer class="full-screen"></div>',
  styles: [
    `
      .full-screen {
        width: 100vw;
        height: 100vh;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
    `
  ],
  imports: [CommonModule]
})

export class GameComponent implements AfterViewInit, OnDestroy {
  // Instancia del juego Phaser
  private game!: Phaser.Game;

  // Referencia al contenedor DOM donde se renderiza Phaser
  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef;

  // Lista de jugadores y jugador actual
  private players: Player[] = [];
  private currentPlayer!: Player;

  constructor(
    private diceService: DiceService,
    private playerService: PlayerService,
    private casillasService: CasillasService 
  ) {}

  /**
   * Inicializa Phaser, los jugadores y los listeners después de que la vista se ha renderizado.
   */
  ngAfterViewInit(): void {
    this.initializePhaserGame();
    this.initializePlayers();
    this.setupEventListeners();
  }

  /**
   * Configura e instancia el juego Phaser.
   */
  private initializePhaserGame(): void {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: this.gameContainer.nativeElement,
      backgroundColor: '#cce3a9',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      callbacks: {
        // Permite compartir servicios Angular con Phaser a través del registry
        preBoot: (game) => {
          game.registry.set('diceService', this.diceService);
        }
      },
      scene: [BoardScene]
    };
    this.game = new Phaser.Game(config);
  }

  /**
   * Inicializa los jugadores y carga sus sprites en Phaser.
   */
  private initializePlayers(): void {
    // Inicializa jugadores usando el servicio correspondiente
    this.playerService.initializePlayers(['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4', 'Jugador 5', 'Jugador 6', 'Jugador 7', 'Jugador 8']);
    this.currentPlayer = this.playerService.currentPlayer;

    // Cuando Phaser esté listo, añade los sprites de los jugadores al tablero
    this.game.events.once('ready', () => {
      this.players.forEach(player => {
        this.game.scene.getScene('BoardScene').add.sprite(0,0,'player_token');
      });
    });
  }

  /**
   * Configura listeners para eventos del dado y del juego.
   */
  private setupEventListeners(): void {
    // Paso por casillas durante el movimiento
    this.game.events.on('passingPosition', (position: number) => {
      this.casillasService.handlePassingPosition(position, this.currentPlayer);
    });
    // Escucha eventos de movimiento de jugador desde Phaser
    this.game.events.on('updatePosition', (newPosition: number) => {
      this.handlePlayerMovement(newPosition);
    });
    // Escucha resultados del dado y mueve al jugador si corresponde
    this.diceService.result$.subscribe(result => {
      if (this.currentPlayer.skipNextTurn) return;
      this.movePlayer(result);
    });
  }

  /**
   * Calcula la nueva posición del jugador y emite el evento para animar el movimiento.
   */
  private movePlayer(spaces: number): void {
    const newPosition = (this.currentPlayer.position + spaces) % 40;
    this.game.events.emit('animateMovement', {
      playerId: this.currentPlayer.id,
      newPosition
    });
  }

  /**
   * Actualiza la posición del jugador y gestiona la lógica de la casilla.
   */
  private handlePlayerMovement(newPosition: number): void {
    this.currentPlayer.position = newPosition;
    this.casillasService.handleBoardPosition(newPosition, this.currentPlayer);
    this.playerService.nextTurn();
    this.currentPlayer = this.playerService.currentPlayer;
  }

  /**
   * Destruye la instancia de Phaser al destruir el componente.
   */
  ngOnDestroy(): void {
    this.game?.destroy(true);
  }
}

// ——————————————————————————————————————————
// Clase BoardScene: escena principal del tablero en Phaser
// ——————————————————————————————————————————
class BoardScene extends Phaser.Scene {
  private diceBtn!: Phaser.GameObjects.Image;
  private diceService!: DiceService;
  private diceSub?: any;
  private diceText!: Phaser.GameObjects.Text;
  private continueText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  private overlay!: Phaser.GameObjects.Rectangle;

  // Fichas de jugadores y estados
  private tokens: Phaser.GameObjects.Image[] = [];
  private currentIndex: number[] = [];
  private playerCount = 8;
  private currentPlayer = 0;
  private cellPositions: { x: number, y: number }[] = [];

  constructor() {
    super({ key: 'BoardScene' });
  }

  /**
   * Inicializa servicios necesarios desde el registry de Phaser.
   */
  init(): void {
    this.diceService = this.game.registry.get('diceService');
  }

  /**
   * Precarga imágenes y recursos necesarios para el tablero y fichas.
   */
  preload(): void {
    this.load.image('tablero', 'assets/images/tablero.png');
    this.load.image('ficha1', 'assets/fichas/JNaranja.png');
    this.load.image('ficha2', 'assets/fichas/JRosaOscuro.png');
    this.load.image('ficha3', 'assets/fichas/JRosaClaro.png');
    this.load.image('ficha4', 'assets/fichas/JMorado.png');
    this.load.image('ficha5', 'assets/fichas/JAzulOscuro.png');
    this.load.image('ficha6', 'assets/fichas/JAzulClaro.png');
    this.load.image('ficha7', 'assets/fichas/JVerde.png');
    this.load.image('ficha8', 'assets/fichas/JAmarillo.png');
    this.load.image('dado', 'assets/images/dado.png');
  }

  /**
   * Crea los elementos visuales del tablero y la interfaz de usuario.
   */
  create(): void {
    const cw = this.scale.width;
    const ch = this.scale.height;

    // 1. Coloca y escala el tablero (75% ancho, pegado a la derecha, centrado vertical)
    const marginRight = 20;
    const board = this.add.image(cw - marginRight, ch / 2, 'tablero').setOrigin(1, 0.5);

    // Escala el tablero para ocupar el 75% del ancho disponible
    const targetW = cw * 0.75;
    const scaleFactor = Math.min(targetW / board.width, ch / board.height);
    board.setScale(scaleFactor);

    // 2. Calcula dimensiones reales tras el escalado
    const bw = board.width * board.scaleX;
    const bh = board.height * board.scaleY;

    // Fondo oscurecido para mostrar encima de la UI
    this.overlay = this.add.rectangle(0, 0, cw, ch, 0x000000, 0.5)
      .setOrigin(0)
      .setVisible(false)
      .setDepth(10);

    // 3. Parámetros de malla: 8 columnas × 5 filas
    const cols = 8;
    const rows = 5;
    const cellW = bw / cols;
    const cellH = bh / rows;

    // 4. Esquina superior-izquierda del tablero
    const topLeftX = board.x - bw;
    const topLeftY = board.y - bh / 2;

    // 5. Calcula posiciones de las casillas en el perímetro (total = 2*(cols+rows)-4)
    const total = 2 * (cols + rows) - 4;
    for (let i = 0; i < total; i++) {
      let row: number, col: number;
      if (i < cols) {
        // Fila inferior, de derecha a izquierda
        row = rows - 1;
        col = cols - 1 - i;
      } else if (i < cols + (rows - 1)) {
        // Columna izquierda, de abajo a arriba
        col = 0;
        row = rows - 1 - (i - (cols - 1));
      } else if (i < cols + (rows - 1) + (cols - 1)) {
        // Fila superior, de izquierda a derecha
        row = 0;
        col = i - (cols + rows - 2);
      } else {
        // Columna derecha, de arriba a abajo
        col = cols - 1;
        row = i - (cols + rows - 2 + cols - 1);
      }
      const x = topLeftX + col * cellW + cellW / 2;
      const y = topLeftY + row * cellH + cellH / 2;
      this.cellPositions.push({ x, y });
    }

    // 6. Debug: dibuja un punto rojo en el centro de cada casilla
    this.cellPositions.forEach((pos) =>
      this.add.circle(pos.x, pos.y, 5, 0xff0000)
    );

    // 7. Añadir fichas de jugadores a la primera casilla
    const startIdx = 11; // Índice inicial (ajustar según diseño)
    for (let i = 0; i < this.playerCount; i++) {
      const pos = this.cellPositions[startIdx];
      const token = this.add.image(pos.x, pos.y, `ficha${i + 1}`)
        .setOrigin(0.5, 0.5)
        .setScale(0.3);
      this.tokens.push(token);
      this.currentIndex.push(startIdx);
    }

    // 8. Texto de turno actual
    this.turnText = this.add.text(20, 20, `Turno: Jugador ${this.currentPlayer + 1}`, {
      fontSize: '24px', color: '#000'
    }).setScrollFactor(0);

    // 9. Texto del dado (resultado)
    const fontSize = Math.floor(this.scale.width * 0.05);
    const fontSizeNumber = Math.floor(this.scale.width * 0.1);
    this.diceText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      '',
      { fontSize: `${fontSizeNumber}px`, color: '#fff' }
    ).setOrigin(0.5)
      .setVisible(false)
      .setDepth(11);

    // 10. Texto de “Haz clic para continuar”
    this.continueText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 100,
      '',
      { fontSize: `${fontSize}px`, color: '#fff' }
    ).setOrigin(0.5)
      .setVisible(false)
      .setDepth(11);

    // 11. Botón de dado
    const diceX = topLeftX + 1.7 * cellW;
    const diceY = topLeftY + 2.9 * cellH + cellH / 2;
    this.diceBtn = this.add.image(diceX, diceY, 'dado')
      .setScale(scaleFactor * 0.3)
      .setInteractive()
      .setScrollFactor(0)
      .on('pointerdown', () => this.onDicePressed());
  }

  /**
   * Lógica al pulsar el botón del dado: lanza el dado y gestiona la animación y el turno.
   */
  private onDicePressed() {
    this.diceBtn.disableInteractive();
    this.overlay.setVisible(true);
    this.diceText.setVisible(true);
    this.continueText.setVisible(false);

    // Cancela suscripción anterior si existe
    this.diceSub?.unsubscribe();
    this.diceService.roll();

    let emissions = 0;
    const maxEmits = 15;
    this.diceSub = this.diceService.result$.subscribe(n => {
      this.diceText.setText(n.toString());
      emissions++;

      if (emissions === maxEmits) {
        this.continueText
          .setText('Pulsa para continuar')
          .setVisible(true);

        // Espera click para continuar y mover ficha
        this.input.once('pointerdown', () => {
          this.overlay.setVisible(false);
          this.diceText.setVisible(false);
          this.continueText.setVisible(false);
          this.moveToken(n, () => {
            this.diceBtn.setInteractive();
            this.turnText.setText(`Turno: Jugador ${this.currentPlayer + 1}`);
          });
        });
      }
    });
  }

  /**
   * Mueve la ficha del jugador actual el número de pasos indicado.
   * @param steps Número de casillas a mover
   * @param onDone Callback al terminar la animación
   */
  private async moveToken(steps: number, onDone: () => void) {
    const total = this.cellPositions.length;
    const from = this.currentIndex[this.currentPlayer];
    const target = this.tokens[this.currentPlayer];

    for (let i = 1; i <= steps; i++) {
      const nextIndex = (from + i) % total;

      // --- Comprobación de paso por casilla 11 o 0 ---
      if (nextIndex === 11 || nextIndex === 0) {
        this.game.events.emit('passingPosition', nextIndex);
      }

      // --- Fin comprobación ---

      const pos = this.cellPositions[nextIndex];
      await new Promise<void>(res => {
        this.tweens.add({
          targets: target,
          x: pos.x, y: pos.y,
          duration: 200,
          ease: 'Linear',
          onComplete: () => res()
        });
      });
    }

    this.currentIndex[this.currentPlayer] = (from + steps) % total;
    const newPosition = this.currentIndex[this.currentPlayer];
    this.currentPlayer = (this.currentPlayer + 1) % this.playerCount;

    this.game.events.emit('updatePosition', newPosition);

    onDone();
  }


  /**
   * Método de actualización de la escena (opcional para animaciones o lógica adicional).
   */
  override update(): void {
    // lógica de actualización (animaciones, turnos, etc.)
  }
}
