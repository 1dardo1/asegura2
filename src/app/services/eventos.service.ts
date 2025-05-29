import { Injectable } from '@angular/core';
import { Evento, TipoSeguro } from '../models/evento.model.js';
import { PlayerService } from './player.service';

@Injectable({ providedIn: 'root' })

export class EventoService {
    public eventos: Evento[] = [];
    constructor(private playerService: PlayerService) {}
    inicializarEventos(): void {
        this.eventos = [
        {
            tipo: TipoSeguro.SALUD,
            texto: 'Te has roto una pierna. Gastos médicos -200€.',
            cantidad: -200,
            variable: 'money',
            descuento: 0.5
        }
        ]
    }
  aplicarEvento(evento: Evento): void {
    const jugador = this.playerService.currentPlayer;
    let cantidadFinal = evento.cantidad;

    // Si el evento es de tipo seguro y el jugador tiene ese seguro, aplica el descuento
    if (
      evento.tipo !== 'EVENTO' &&
      jugador.insured?.includes(evento.tipo) &&
      evento.descuento
    ) {
      cantidadFinal = evento.cantidad * (1 - evento.descuento);
    }

    switch (evento.variable) {
      case 'money':
        jugador.money += cantidadFinal;
        break;
      case 'salary':
        jugador.salary += cantidadFinal;
        break;
      case 'rent':
        jugador.rent += cantidadFinal;
        break;
    }

    this.playerService.updatePlayer(jugador);
  }
}
