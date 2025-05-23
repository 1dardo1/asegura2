// ======== Importaciones ========
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Component,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { Subscription } from 'rxjs';

// Frameworks y servicios
import Phaser from 'phaser';
import { DiceService } from '../../services/dice.service';
import { PlayerService } from '../../services/player.service';
import { CasillasService } from '../../services/casillas.service';
import { Player } from '../../models/player.model';

// ======== Enumerados ========
enum Dificultad {
  FACIL = "FACIL",
  MEDIA = "MEDIA",
  DIFICIL = "DIFICIL"
}

// ======== Decorador del Componente ========
/**
 * Componente principal del juego.
 * Renderiza el contenedor de Phaser y gestiona la lógica de jugadores y eventos.
 */
@Component({
  standalone: true,
  selector: 'app-game',
  template: '<div #gameContainer class="full-screen"></div>',
  styles: [`
    .full-screen {
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  `],
  imports: [CommonModule]
})



// ======== Clase del Componente ========
export class GameComponent implements AfterViewInit, OnDestroy {
  // ======== Inicializaciones ========
  // Servicios inyectados
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private diceService = inject(DiceService);
  private playerService = inject(PlayerService);
  private casillasService = inject(CasillasService);

  // Referencias del DOM
  @ViewChild('gameContainer', { static: true }) gameContainer!: ElementRef;

  // Estado del juego
  private game!: Phaser.Game;
  private playersSub!: Subscription;
  private players: Player[] = [];
  private currentPlayer!: Player;

  // Señales de estado
  Dificultad = Dificultad;
  dificultad = signal<Dificultad | null>(null);
  equipos = signal<boolean | null>(null);
  cantidadDeJugadores = signal<number | null>(null);
  jugadores = signal<string[] | null>(null);

  // ======== Métodos del ciclo de vida ========
  ngOnInit() {
    this.route.queryParams.subscribe((params: { [key: string]: any }) => {
      this.dificultad.set(params['dificultad']);
      this.equipos.set(params['equipos']);
      this.cantidadDeJugadores.set(params['cantidadDeJugadores']);
      this.jugadores.set(params['jugadores']);

      this.validateGameParameters();
    });
  }

  ngAfterViewInit(): void {
    this.initializePhaserGame();
    this.initializePlayers();
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    this.cleanupGameResources();
  }

  // ======== Métodos de inicialización ========
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
        preBoot: (game) => this.registerPhaserServices(game)
      },
      scene: [BoardScene]
    };
    this.game = new Phaser.Game(config);
  }

  private registerPhaserServices(game: Phaser.Game): void {
    game.registry.set('diceService', this.diceService);
    game.registry.set('playerService', this.playerService);
    game.registry.set('dificultad', this.dificultad());
    game.registry.set('jugadores', this.jugadores());
    game.registry.set('equipos', this.equipos());
    game.registry.set('cantidadDeJugadores', this.cantidadDeJugadores());
  }

  private initializePlayers(): void {
    if (!this.playerService.getCurrentPlayers().length) {
      this.playerService.initializePlayers(this.jugadores()!);
    }
    this.currentPlayer = this.playerService.currentPlayer;

    this.game.events.once('ready', () => {
      this.players.forEach(player => {
        this.game.scene.getScene('BoardScene').add.sprite(0, 0, 'player_token');
      });
    });
  }

  // ======== Métodos de lógica principal ========
  private setupEventListeners(): void {
    this.game.events.on('passingPosition', (position: number) => {
      this.casillasService.handlePassingPosition(position, this.currentPlayer);
    });

    this.game.events.on('updatePosition', (newPosition: number) => {
      this.handlePlayerMovement(newPosition);
    });

    this.diceService.result$.subscribe(result => {
      if (!this.currentPlayer.skipNextTurn) this.movePlayer(result);
    });
  }

  private movePlayer(spaces: number): void {
    const newPosition = (this.currentPlayer.position + spaces) % 22;
    this.playerService.updatePlayerPosition(this.currentPlayer.id, newPosition);
    this.game.events.emit('animateMovement', {
      playerId: this.currentPlayer.id,
      newPosition
    });
  }

  private handlePlayerMovement(newPosition: number): void {
    this.currentPlayer.position = newPosition;
    this.casillasService.handleBoardPosition(newPosition, this.currentPlayer);
    this.playerService.nextTurn();
    this.currentPlayer = this.playerService.currentPlayer;
  }

  // ======== Métodos de validación y limpieza ========
  private validateGameParameters(): void {
    if (
      !this.dificultad() ||
      this.equipos() === null ||
      !this.cantidadDeJugadores() ||
      !this.jugadores()
    ) {
      alert('Error: Faltan parámetros obligatorios en la URL.');
      this.router.navigate(['sala']);
    }
  }

  private cleanupGameResources(): void {
    this.game?.destroy(true);
    this.playersSub?.unsubscribe();
  }
}

class BoardScene extends Phaser.Scene {
  // ======== Inicializaciones de variables y servicios ========
  private diceBtn!: Phaser.GameObjects.Image;
  private diceService!: DiceService;
  private playerService!: PlayerService;
  private diceSub?: any;
  private diceText!: Phaser.GameObjects.Text;
  private continueText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  private overlay!: Phaser.GameObjects.Rectangle;

  // Configuración y estado del juego
  dificultad = signal<Dificultad | null>(null);
  equipos = signal<boolean | null>(null);
  cantidadDeJugadores = 0;
  jugadores = signal<string[] | null>(null);

  // Fichas y posiciones de jugadores
  private tokens: Phaser.GameObjects.Image[] = [];
  private currentIndex: number[] = [];
  private playerCount = signal<number | null>(null);
  private currentPlayer = 0;
  private cellPositions: { x: number, y: number }[] = [];

  constructor() {
    super({ key: 'BoardScene' });
  }

  // ======== Métodos de ciclo de vida Phaser ========

  /**
   * Inicializa servicios necesarios desde el registry de Phaser.
   */
  init(): void {
    this.diceService = this.game.registry.get('diceService');
    this.playerService = this.game.registry.get('playerService');
    this.dificultad = this.game.registry.get('dificultad');
    this.jugadores = this.game.registry.get('jugadores');
    this.cantidadDeJugadores = this.game.registry.get('cantidadDeJugadores');
    this.equipos = this.game.registry.get('equipos');
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

    // 1. Coloca y escala el tablero
    const marginRight = 20;
    const board = this.add.image(cw - marginRight, ch / 2, 'tablero').setOrigin(1, 0.5);
    const targetW = cw * 0.75;
    const scaleFactor = Math.min(targetW / board.width, ch / board.height);
    board.setScale(scaleFactor);

    // 2. Calcula dimensiones reales tras el escalado
    const bw = board.width * board.scaleX;
    const bh = board.height * board.scaleY;

    // 3. Fondo oscurecido para la UI
    this.overlay = this.add.rectangle(0, 0, cw, ch, 0x000000, 0.5)
      .setOrigin(0)
      .setVisible(false)
      .setDepth(10);

    // 4. Parámetros de malla y cálculo de casillas
    const cols = 8;
    const rows = 5;
    const cellW = bw / cols;
    const cellH = bh / rows;
    const topLeftX = board.x - bw;
    const topLeftY = board.y - bh / 2;
    const total = 2 * (cols + rows) - 4;

    for (let i = 0; i < total; i++) {
      let row: number, col: number;
      if (i < cols) {
        row = rows - 1;
        col = cols - 1 - i;
      } else if (i < cols + (rows - 1)) {
        col = 0;
        row = rows - 1 - (i - (cols - 1));
      } else if (i < cols + (rows - 1) + (cols - 1)) {
        row = 0;
        col = i - (cols + rows - 2);
      } else {
        col = cols - 1;
        row = i - (cols + rows - 2 + cols - 1);
      }
      const x = topLeftX + col * cellW + cellW / 2;
      const y = topLeftY + row * cellH + cellH / 2;
      this.cellPositions.push({ x, y });
    }

    // 5. Debug: dibuja un punto rojo en el centro de cada casilla
    this.cellPositions.forEach((pos) =>
      this.add.circle(pos.x, pos.y, 5, 0xff0000)
    );

    // 6. Añadir fichas de jugadores a la primera casilla
    const players = this.playerService.getCurrentPlayers();
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const posIndex = player?.position ?? 11;
      const pos = this.cellPositions[posIndex];
      const token = this.add.image(pos.x, pos.y, `ficha${i + 1}`)
        .setOrigin(0.5, 0.5)
        .setScale(0.3);
      this.tokens.push(token);
      this.currentIndex.push(posIndex);
    }

    // 7. Texto de turno actual
    this.turnText = this.add.text(20, 20, `Turno: ${this.currentPlayer + 1}`, {
      fontSize: '24px', color: '#000'
    }).setScrollFactor(0);

    // 8. Texto del dado (resultado)
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

    // 9. Texto de “Haz clic para continuar”
    this.continueText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 100,
      '',
      { fontSize: `${fontSize}px`, color: '#fff' }
    ).setOrigin(0.5)
      .setVisible(false)
      .setDepth(11);

    // 10. Botón de dado
    const diceX = topLeftX + 1.7 * cellW;
    const diceY = topLeftY + 2.9 * cellH + cellH / 2;
    this.diceBtn = this.add.image(diceX, diceY, 'dado')
      .setScale(scaleFactor * 0.3)
      .setInteractive()
      .setScrollFactor(0)
      .on('pointerdown', () => this.onDicePressed());
  }

  // ======== Métodos de lógica principal ========

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
    this.currentPlayer = (this.currentPlayer + 1) % this.cantidadDeJugadores;

    this.game.events.emit('updatePosition', newPosition);

    onDone();
  }
}