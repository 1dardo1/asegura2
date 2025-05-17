import { CommonModule } from '@angular/common';
import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
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
  @ViewChild('gameContainer', { static: false })
  gameContainer!: ElementRef<HTMLDivElement>;

  private phaserGame!: Phaser.Game;

  constructor(
    private injector: Injector,          // 🔹 para recuperar servicios
    private diceService: DiceService     // 🔹 inyectamos el DiceService
  ) {}

  ngAfterViewInit(): void {
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
        preBoot: (game) => {
          game.registry.set('diceService', this.diceService);
        }
      },  
      scene: [BoardScene]
    };

    this.phaserGame = new Phaser.Game(config);
  }

  ngOnDestroy(): void {
    this.phaserGame?.destroy(true);
  }
}

// ——————————————————————————————————————————
// Scene “BoardScene” definida en el mismo fichero
// ——————————————————————————————————————————
class BoardScene extends Phaser.Scene {
  private diceBtn!: Phaser.GameObjects.Image;
  private diceService!: DiceService;          
  private diceSub?: any;
  private diceText!: Phaser.GameObjects.Text;
  private continueText!: Phaser.GameObjects.Text;
  private turnText!: Phaser.GameObjects.Text;
  private overlay!: Phaser.GameObjects.Rectangle;

  


  private tokens: Phaser.GameObjects.Image[] = [];
  private currentIndex: number[] = [];
  private playerCount = 8;
  private currentPlayer = 0;
  private cellPositions: { x: number, y: number }[] = [];

  constructor() {
    super({ key: 'BoardScene' });
  }

  init(): void {
    //recuperamos el DiceService del registry
    this.diceService = this.game.registry.get('diceService');
    
  }

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

  create(): void {

    
    const cw = this.scale.width;
    const ch = this.scale.height;

    // 1. Coloca y escala el tablero (75% ancho, pegado a la derecha, centrado vertical)
    const marginRight = 20;
    const board = this.add.image(cw - marginRight, ch / 2, 'tablero').setOrigin(1, 0.5);
    
    const targetW = cw * 0.75;                           // quieres 75% del ancho disponible
    const scaleFactor = Math.min(targetW / board.width, ch / board.height);
    board.setScale(scaleFactor);

    // 2. Calcula dimensiones reales tras el scale
    const bw = board.width * board.scaleX;
    const bh = board.height * board.scaleY;

    // Fondo oscurecido
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
        // fila inferior, de derecha a izquierda
        row = rows - 1;
        col = cols - 1 - i;
      } else if (i < cols + (rows - 1)) {
        // columna izquierda, de abajo a arriba
        col = 0;
        row = rows - 1 - (i - (cols - 1));
      } else if (i < cols + (rows - 1) + (cols - 1)) {
        // fila superior, de izquierda a derecha
        row = 0;
        col = i - (cols + rows - 2);
      } else {
        // columna derecha, de arriba a abajo
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

    // 8. Añadir fichas de jugadores a la primera casilla
    const startIdx = 11; // índice inicial que ya usabas
    for (let i = 0; i < this.playerCount; i++) {
      const pos = this.cellPositions[startIdx];
      const token = this.add.image(pos.x, pos.y, `ficha${i+1}`).setOrigin(0.5, 0.5).setScale(0.3)
      this.tokens.push(token);
      this.currentIndex.push(startIdx);
    }

    this.turnText = this.add.text(20, 20, `Turno: Jugador ${this.currentPlayer + 1}`, {
      fontSize: '24px', color: '#000'
    }).setScrollFactor(0);
// Texto del dado
this.diceText = this.add.text(
  this.scale.width / 2,
  this.scale.height / 2,
  '',
  { fontSize: '120px', color: '#fff' }
).setOrigin(0.5).setVisible(false)
 .setDepth(11); // Asegura que esté por encima

// Texto de “Haz clic para continuar”
this.continueText = this.add.text(
  this.scale.width / 2,
  this.scale.height / 2 + 100,
  '',
  { fontSize: '24px', color: '#fff' }
).setOrigin(0.5).setVisible(false)
 .setDepth(11); // También por encima


    // Botón de dado
    const diceX = topLeftX + 1.7 * cellW;
    const diceY = topLeftY + 2.9 * cellH + cellH / 2;

    this.diceBtn = this.add.image(diceX, diceY, 'dado')
      .setScale(scaleFactor * 0.3)   // escala proporcional al tablero
      .setInteractive()
      .setScrollFactor(0)
      .on('pointerdown', () => this.onDicePressed());
  }

  private onDicePressed() {
    this.diceBtn.disableInteractive();
    this.overlay.setVisible(true);
    this.diceText.setVisible(true);
    this.continueText.setVisible(false);
  
    this.diceSub?.unsubscribe();
    this.diceService.roll();
  
    let emissions = 0;
    const maxEmits = 15;
    this.diceSub = this.diceService.result$.subscribe(n => {
      this.diceText.setText(n.toString());
      emissions++;
  
      if (emissions === maxEmits) {
        this.continueText
          .setText('Haz clic para continuar')
          .setVisible(true);
  
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
  

  private async moveToken(steps: number, onDone: () => void) {
    const total = this.cellPositions.length;
    const from = this.currentIndex[this.currentPlayer];
    const target = this.tokens[this.currentPlayer];

    for (let i = 1; i <= steps; i++) {
      const pos = this.cellPositions[(from + i) % total];
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

    // rotamos turno
    this.currentIndex[this.currentPlayer] = (from + steps) % total;
    this.currentPlayer = (this.currentPlayer + 1) % this.playerCount;

    onDone();
  }
  override update(): void {
    // lógica de actualización (animaciones, turnos, etc.)
  }
}
