import { Injectable } from '@angular/core';
import { Player } from '../models/player.model';
import { Evento } from '../models/evento.model';
import { seguros } from './casillas.service';

@Injectable({ providedIn: 'root' })
export class BoardUiService {
  private scene!: Phaser.Scene;
  private playerCardObjects: Phaser.GameObjects.GameObject[] = [];
  private tokens: Phaser.GameObjects.Image[] = [];
  private cellPositions: { x: number; y: number }[] = [];
  private diceBtn!: Phaser.GameObjects.Image;
  private diceText!: Phaser.GameObjects.Text;
  private continueText!: Phaser.GameObjects.Text;
  private overlay!: Phaser.GameObjects.Rectangle;
  private errorModalGroup?: Phaser.GameObjects.Group;
  private isModalOpen = false;
  private modalQueue: (() => void)[] = [];
  private boardImage!: Phaser.GameObjects.Image;


  // Callbacks para interacción
  onDicePressed?: () => void;
  onModalAction?: (action: string, data?: any) => void;

  init(scene: Phaser.Scene): void {
    this.scene = scene;
    console.log('[UI] BoardUiService inicializado con escena:', scene.scene.key);
    this.setupBoard();
    this.createDiceButton();
    this.createOverlay();
    this.createDiceText();
  }

  private setupBoard(): void {
    const cw = this.scene.scale.width;
    const ch = this.scene.scale.height;
    const marginRight = 20;
    const board = this.scene.add.image(cw - marginRight, ch / 2, 'tablero').setOrigin(1, 0.5);
    
    
    const targetW = cw * 0.75;
    const scaleFactor = Math.min(targetW / board.width, ch / board.height);
    board.setScale(scaleFactor);
    this.boardImage = board;

    const bw = board.width * board.scaleX;
    const bh = board.height * board.scaleY;
    const topLeftX = board.x - bw;
    const topLeftY = board.y - bh / 2;

    // Calcular posiciones de las celdas
    const cols = 8;
    const rows = 5;
    const cellW = bw / cols;
    const cellH = bh / rows;
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
  }

  private createDiceButton(): void {
    const board = this.boardImage;
    if (!board) return;

    const relX = board.x - board.displayWidth * 0.79; // 10% desde el borde derecho
    const relY = board.y + board.displayHeight * 0.19; // 40% hacia abajo desde 
    
     this.diceBtn = this.scene.add.image(relX, relY, 'dado')
    .setOrigin(0.5)
    .setScale(board.scaleX * 0.3) // Escala proporcional al tablero
    .setInteractive()
    .on('pointerdown', () => this.onDicePressed?.());
  }

  private createOverlay(): void {
    this.overlay = this.scene.add.rectangle(0, 0, 
      this.scene.scale.width, 
      this.scene.scale.height, 
      0x000000, 0.5
    ).setOrigin(0).setVisible(false).setDepth(10);
  }

  private createDiceText(): void {
    const fontSize = Math.floor(this.scene.scale.width * 0.1);
    this.diceText = this.scene.add.text(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      '',
      { fontSize: `${fontSize}px`, color: '#fff' }
    ).setOrigin(0.5).setVisible(false).setDepth(11);

    this.continueText = this.scene.add.text(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2 + 100,
      '',
      { fontSize: `${Math.floor(fontSize * 0.5)}px`, color: '#fff' }
    ).setOrigin(0.5).setVisible(false).setDepth(11);
  }

  // ======== Gestión de Jugadores ========
 updatePlayerCards(players: Player[]): void {
    if (!this.scene) {
      console.warn("Escena no inicializada. Posponiendo dibujo de jugadores.");
      return;
    }
    console.log('[UI] updatePlayerCards llamado con', players.map(p => p.name));
    this.clearPlayerCards();
    this.drawPlayerCards(players);
  }

  private drawPlayerCards(players: Player[]): void {
    const cw = this.scene.scale.width;
    const ch = this.scene.scale.height;
    const rightMargin = 10;
    const areaWidth = cw * 0.25 - rightMargin;
    const cardMargin = 20;
    const cardSpacing = 5;
    const cellGap = 8;
    const cardPadding = 12;
    const cellRadius = 14;
    const cardHeight = Math.min(120, (ch - cardMargin * 2 - cardSpacing * (players.length - 1)) / players.length);
    const cardWidth = areaWidth - cardMargin * 2;

    const cardBgColors = [
      0xff8203, 0xfe2b7c, 0xe18dc7, 0x6f2495,
      0x006b9a, 0x00c0fa, 0x008822, 0xcdad00
    ];

    players.forEach((player, i) => {
      const x = cardMargin;
      const y = cardMargin + i * (cardHeight + cardSpacing);

      const cardGraphics = this.scene.add.graphics();
      cardGraphics.fillStyle(cardBgColors[i % cardBgColors.length], 0.7);
      cardGraphics.fillRoundedRect(x, y, cardWidth, cardHeight, cellRadius);
      this.playerCardObjects.push(cardGraphics);

      const innerX = x + cardPadding;
      const innerY = y + cardPadding;
      const innerWidth = cardWidth - 2 * cardPadding;
      const innerHeight = cardHeight - 2 * cardPadding;
      const cellW = (innerWidth - cellGap) / 2;
      const cellH = (innerHeight - cellGap) / 2;

      // Nombre del jugador
      this.playerCardObjects.push(this.scene.add.text(
        innerX + cellW / 2, innerY + cellH / 2,
        player.name,
        { font: 'bold 17px Arial', color: '#000', align: 'center' }
      ).setOrigin(0.5));

      // Dinero
      const dineroGraphics = this.scene.add.graphics();
      dineroGraphics.fillStyle(0xffffff, 0.5);
      dineroGraphics.fillRoundedRect(innerX, innerY + cellH + cellGap, cellW, cellH, cellRadius / 2);
      this.playerCardObjects.push(dineroGraphics);
      
      this.playerCardObjects.push(this.scene.add.text(
        innerX + cellW / 2, innerY + cellH + cellGap + cellH / 2,
        `${player.money}€`,
        { font: '16px Arial', color: '#000', align: 'center' }
      ).setOrigin(0.5));

      // Sueldo
      const sueldoGraphics = this.scene.add.graphics();
      sueldoGraphics.fillStyle(0x4ce451, 0.85);
      sueldoGraphics.fillRoundedRect(innerX + cellW + cellGap, innerY, cellW, cellH, cellRadius / 2);
      this.playerCardObjects.push(sueldoGraphics);
      
      this.playerCardObjects.push(this.scene.add.text(
        innerX + cellW + cellGap + cellW / 2, innerY + cellH / 2,
        `${player.salary}€`,
        { font: '16px Arial', color: '#000', align: 'center' }
      ).setOrigin(0.5));

      // Pago
      const pagoGraphics = this.scene.add.graphics();
      pagoGraphics.fillStyle(0xe93838);
      pagoGraphics.fillRoundedRect(innerX + cellW + cellGap, innerY + cellH + cellGap, cellW, cellH, cellRadius / 2);
      this.playerCardObjects.push(pagoGraphics);
      
      this.playerCardObjects.push(this.scene.add.text(
        innerX + cellW + cellGap + cellW / 2, innerY + cellH + cellGap + cellH / 2,
        `${player.rent}€`,
        { font: '16px Arial', color: '#000', align: 'center' }
      ).setOrigin(0.5));
    });
  }

  private clearPlayerCards(): void {
    this.playerCardObjects.forEach(obj => obj.destroy());
    this.playerCardObjects = [];
  }

  // ======== Gestión de Fichas ========
  createTokens(players: Player[]): void {
    if (!this.scene) {
      console.warn("Escena no inicializada. Posponiendo creación de fichas.");
      return;
    }
    console.log('[UI] createTokens llamado con', players.map(p => p.name));
    const board = this.boardImage;
    this.tokens = players.map((player, i) => {
      const posIndex = player.position;
      const pos = this.cellPositions[posIndex];
      return this.scene.add.image(pos.x, pos.y, `ficha${i + 1}`)
        .setOrigin(0.5, 0.5)
        .setScale(board.scaleX * 0.75);
    });
  }

  updateTokenPosition(playerIndex: number, position: number): void {
    const token = this.tokens[playerIndex];
    const newPos = this.cellPositions[position];
    this.scene.tweens.add({
      targets: token,
      x: newPos.x,
      y: newPos.y,
      duration: 200,
      ease: 'Linear'
    });
  }

  // ======== Gestión de Dado ========
  showDiceRoll(): void {
    this.diceBtn.disableInteractive();
    this.overlay.setVisible(true);
    this.diceText.setVisible(true);
    this.continueText.setVisible(false);
  }

  updateDiceValue(value: number): void {
    this.diceText.setText(value.toString());
  }

  showContinuePrompt(): void {
    this.continueText.setText('Pulsa para continuar').setVisible(true);
  }

  hideDiceElements(): void {
    this.overlay.setVisible(false);
    this.diceText.setVisible(false);
    this.continueText.setVisible(false);
  }

  enableDiceButton(): void {
    this.diceBtn.setInteractive();
  }

  // ======== Gestión de Modales ========
  showInsuranceModal(player: Player, seguro: seguros, evento?: Evento): void {
    console.log('[UI] showInsuranceModal llamado para', player.name, seguro, evento);
    this.scene.time.paused = true;
    this.isModalOpen = true;

    const DEPTH_MODAL = 10000;
    const modalWidth = 400;
    const modalHeight = 350;
    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    // Overlay
    const overlay = this.scene.add.rectangle(centerX, centerY, 
      this.scene.cameras.main.width, 
      this.scene.cameras.main.height, 
      0x000000, 0.7
    ).setInteractive().setDepth(DEPTH_MODAL);
    

    // Modal background
    let modalColor: number;
    switch (seguro) {
      case 'EVENTO': modalColor = 0xff7a00; break;
      case 'PAGO_MENSUAL': modalColor = 0xe93838; break;
      case 'SUELDO': modalColor = 0x4ce451; break;
      default: modalColor = 0xc8c4c4;
    }
    
    const modal = this.scene.add.rectangle(centerX, centerY, modalWidth, modalHeight, modalColor, 1)
      .setInteractive()
      .setDepth(DEPTH_MODAL + 1);

    // Contenido del modal
    const content = this.createModalContent(centerX, centerY, seguro, evento);
    const buttons = this.createModalButtons(centerX, centerY, seguro);

    // Configurar interacciones
    this.setupModalInteractions(overlay, modal, content, buttons, seguro, player, evento);
  }

  private createModalContent(centerX: number, centerY: number, seguro: seguros, evento?: Evento) {
    let img: Phaser.GameObjects.Image | null = null;
    let texto: Phaser.GameObjects.Text;

    // Determinar imagen según tipo de seguro/evento
    const nombreImagen = this.getImageName(seguro, evento);
    if (nombreImagen) {
      img = this.scene.add.image(centerX, centerY - 90, nombreImagen)
        .setDisplaySize(80, 80)
        .setDepth(1002);
    }

    // Crear texto del modal
    const nombreSeguro = this.getInsuranceName(seguro);
    const precioSeguro = this.getInsurancePrice(seguro);
    
    if (precioSeguro !== null && precioSeguro !== undefined) {
      texto = this.scene.add.text(centerX, centerY - 20, 
        `${nombreSeguro}\nPrecio: ${precioSeguro}€`, 
        { font: '20px Arial', color: '#000', align: 'center', wordWrap: { width: 360 }}
      ).setOrigin(0.5).setDepth(1002);
    } else {
      if (seguro === 'EVENTO' && evento) {
        texto = this.scene.add.text(centerX, centerY - 20, 
          evento.texto, 
          { font: '20px Arial', color: '#000', align: 'center', wordWrap: { width: 360 }}
        ).setOrigin(0.5).setDepth(1002);
      } else {
        texto = this.scene.add.text(centerX, centerY - 20, 
          nombreSeguro, 
          { font: '20px Arial', color: '#000', align: 'center', wordWrap: { width: 360 }}
        ).setOrigin(0.5).setDepth(1002);
      }
    }

    return { img, texto };
  }

  private createModalButtons(centerX: number, centerY: number, seguro: seguros) {
    let btnComprar: Phaser.GameObjects.Text | null = null;
    let btnNoComprar: Phaser.GameObjects.Text | null = null;
    let btnSiguiente: Phaser.GameObjects.Text | null = null;

    switch (seguro) {
      case 'EVENTO':
      case 'SUELDO':
      case 'PAGO_MENSUAL':
        btnSiguiente = this.scene.add.text(
          centerX,
          centerY + 60,
          'Siguiente',
          { font: '18px Arial', color: '#fff', backgroundColor: '#007bff', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive().setDepth(1002);
        break;
      default:
        btnComprar = this.scene.add.text(
          centerX,
          centerY + 60,
          'Comprar',
          { font: '18px Arial', color: '#fff', backgroundColor: '#28a745', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive().setDepth(1002);

        btnNoComprar = this.scene.add.text(
          centerX,
          centerY + 110,
          'No comprar',
          { font: '18px Arial', color: '#fff', backgroundColor: '#dc3545', padding: { x: 20, y: 10 } }
        ).setOrigin(0.5).setInteractive().setDepth(1002);
    }

    return { btnComprar, btnNoComprar, btnSiguiente };
  }

  private setupModalInteractions(
    overlay: Phaser.GameObjects.Rectangle,
    modal: Phaser.GameObjects.Rectangle,
    content: { img: any, texto: any },
    buttons: any,
    seguro: seguros,
    player: Player,
    evento?: Evento
  ) {
    const limpiarModal = () => {
      overlay.destroy();
      modal.destroy();
      content.texto.destroy();
      content.img?.destroy();
      buttons.btnComprar?.destroy();
      buttons.btnNoComprar?.destroy();
      buttons.btnSiguiente?.destroy();
      this.scene.time.paused = false;
      this.isModalOpen = false;
      this.processModalQueue();
    };

    if (buttons.btnComprar) {
      buttons.btnComprar.on('pointerdown', () => {
        console.log('[UI] Botón COMPRAR pulsado en modal:', seguro, player.name);
        const precioSeguro = this.getInsurancePrice(seguro);
        if (precioSeguro !== null && precioSeguro !== undefined && player.money < precioSeguro) {
          this.onModalAction?.('error', 'No tienes suficiente dinero');
          return;
        }
        this.onModalAction?.('comprar', { player, seguro, precioSeguro });
        limpiarModal();
      });
    }

    if (buttons.btnNoComprar) {
      buttons.btnNoComprar.on('pointerdown', () => {
        console.log('[UI] Botón NO COMPRAR pulsado en modal:', seguro, player.name);
        this.onModalAction?.('cancelar');
        limpiarModal();
      });
    }

    if (buttons.btnSiguiente) {
      buttons.btnSiguiente.on('pointerdown', () => {
        console.log('[UI] Botón SIGUIENTE pulsado en modal:', seguro, player.name);
        this.onModalAction?.('siguiente', { player, seguro, evento });
        limpiarModal();
      });
    }
  }

  // ======== Gestión de Errores ========
  showErrorModal(message: string, type: 'error' | 'info' = 'error'): void {
    if (!this.scene) {
      console.error('No se puede mostrar modal: escena no inicializada');
      return;
    }
    if (this.errorModalGroup) return;

    const width = this.scene.scale.width;
    const height = this.scene.scale.height;
    const bgColor = type === 'error' ? 0x2b2b2b : 0xc8c4c4;
    const textColor = type === 'error' ? '#fff' : '#000';

    this.errorModalGroup = this.scene.add.group();

    // Bloqueador de fondo
    const blocker = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.001)
      .setInteractive()
      .setDepth(19999);
    this.errorModalGroup.add(blocker);

    // Fondo del modal
    const bg = this.scene.add.rectangle(width / 2, height / 2, width * 0.5, 180, bgColor)
      .setDepth(20000);
    this.errorModalGroup.add(bg);

    // Texto del error
    const text = this.scene.add.text(width / 2, height / 2 - 30, message, {
      font: '20px Arial',
      color: textColor,
      align: 'center',
      wordWrap: { width: width * 0.45 }
    }).setOrigin(0.5).setDepth(20001);
    this.errorModalGroup.add(text);

    // Botón de aceptar
    const btn = this.scene.add.text(width / 2, height / 2 + 50, 'Aceptar', {
      font: '18px Arial',
      color: '#000',
      backgroundColor: '#fff',
      align: 'center'
    }).setOrigin(0.5).setInteractive().setDepth(20002)
      .setPadding({ left: 32, right: 32, top: 10, bottom: 10 });

    btn.on('pointerdown', () => {
      this.errorModalGroup?.destroy(true, true);
      this.errorModalGroup = undefined;
    });
    this.errorModalGroup.add(btn);
  }

  // ======== Helpers ========
  private getImageName(seguro: seguros, evento?: Evento): string | null {
    if (evento && evento.tipo) {
      return evento.tipo.toLowerCase();
    }
    return seguro.toLowerCase();
  }

  private getInsuranceName(seguro: seguros): string {
    switch (seguro) {
      case seguros.SALUD: return 'Seguro de Salud';
      case seguros.VIDA: return 'Seguro de Vida';
      case seguros.COCHE: return 'Seguro de Coche';
      case seguros.VIAJE: return 'Seguro de Viaje';
      case seguros.HOGAR: return 'Seguro de Hogar';
      case seguros.RESPONSABILIDAD_CIVIL: return 'Seguro de Responsabilidad Civil';
      case seguros.CAJA_AHORROS: return 'Caja de Ahorros';
      case seguros.EVENTO: return 'Evento';
      default: return 'Seguro desconocido';
    }
  }

  private getInsurancePrice(seguro: seguros): number | null {
    switch (seguro) {
      case seguros.SALUD: return 200;
      case seguros.VIDA: return 300;
      case seguros.COCHE: return 400;
      case seguros.VIAJE: return 400;
      case seguros.HOGAR: return 500;
      case seguros.RESPONSABILIDAD_CIVIL: return 200;
      case seguros.CAJA_AHORROS: return 50; 
      default: return null;
    }
  }

  private processModalQueue(): void {
    if (this.modalQueue.length > 0) {
      const nextModal = this.modalQueue.shift();
      nextModal?.();
    }
  }
}