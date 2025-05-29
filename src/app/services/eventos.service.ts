import { Injectable } from '@angular/core';
import { Evento, TipoSeguro } from '../models/evento.model.js';
import { PlayerService } from './player.service';
import { Player } from '../models/player.model.js';

@Injectable({ providedIn: 'root' })

export class EventoService {
    private eventos: Evento[] = [];
    constructor(private playerService: PlayerService) {}


    inicializarEventos(): void {
        this.eventos = [
        {
            tipo: TipoSeguro.SALUD,
            texto: 'Te has roto una pierna. Gastos médicos 200€.',
            cantidad: -200,
            variable: 'money',
            descuento: 0.5
        }
        ];
    }

    getEventos(): Evento[] {
        return this.eventos;
    }

    getEventoAleatorio(): Evento {
        const index = Math.floor(Math.random() * this.eventos.length);
        return this.eventos[index];
    }

    aplicarEvento(evento: Evento, player: Player): { aplicado: boolean; descuentoAplicado: boolean; cantidadFinal: number } {
        const jugador = player;
        let cantidadFinal = evento.cantidad;
        let descuentoAplicado = false;

        if (
            evento.tipo !== 'EVENTO' &&
            jugador.insured?.includes(evento.tipo) &&
            evento.descuento
        ) {
            const descuento = evento.cantidad * evento.descuento;
            cantidadFinal = evento.cantidad - descuento;
            descuentoAplicado = true;
        }

        // Verificar si puede pagar ANTES de aplicar
        if (evento.cantidad < 0 && Math.abs(cantidadFinal) > jugador.money) {
            return { aplicado: false, descuentoAplicado: false, cantidadFinal: 0 };
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
        return { aplicado: true, descuentoAplicado, cantidadFinal };
    }

}
