import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { HttpClient } from '@angular/common/http'; // Añade esta importación
import { Evento, TipoSeguro } from '../models/evento.model';
=======
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Evento, TipoSeguro } from '../models/evento.model.js';
>>>>>>> playersBD
import { PlayerService } from './player.service';
import { Player } from '../models/player.model';
import { Observable, tap } from 'rxjs'; // Añade estas importaciones

@Injectable({ providedIn: 'root' })
export class EventoService {
<<<<<<< HEAD
    private eventos: Evento[] = [];

    constructor(
        private playerService: PlayerService,
        private http: HttpClient
    ) {}

    cargarEventosDesdeBackend(): Observable<Evento[]> {
        return this.http.get<Evento[]>('/api/eventos').pipe(
            tap(eventos => {
                this.eventos = eventos;
            })
        );
    }
    inicializarEventos(): Observable<Evento[]> {
        return this.cargarEventosDesdeBackend();
=======
  // ======== CAMBIO: De array vacío a BehaviorSubject ========
  private eventosSubject = new BehaviorSubject<Evento[]>([]);
  public eventos$ = this.eventosSubject.asObservable();

  // ======== CAMBIO: Inyectar HttpClient ========
  constructor(
    private playerService: PlayerService,
    private http: HttpClient
  ) {
    // ======== CAMBIO: Carga automática al inicializar ========
    this.cargarEventosDesdeBackend();
  }

  // ======== NUEVO MÉTODO: Carga desde MongoDB ========
  private cargarEventosDesdeBackend(): void {
    this.http.get<Evento[]>('/api/eventos').subscribe({
      next: (eventos) => {
        if (eventos && eventos.length > 0) {
          this.eventosSubject.next(eventos);
          console.log('Eventos cargados desde MongoDB:', eventos.length);
        } else {
          console.warn('No se encontraron eventos en la base de datos');
        }
      },
      error: (error) => {
        console.error('Error al cargar eventos desde backend:', error);
      }
    });
  }

  // ======== MÉTODO MODIFICADO: Obtener desde BehaviorSubject ========
  getEventos(): Evento[] {
    return this.eventosSubject.value;
  }

  // ======== MÉTODO MEJORADO: Con validación de array vacío ========
  getEventoAleatorio(): Evento | null {
    const eventos = this.eventosSubject.value;
    if (eventos.length === 0) {
      console.warn('No hay eventos disponibles');
      return null;
    }
    const index = Math.floor(Math.random() * eventos.length);
    return eventos[index];
  }

  // ======== NUEVO MÉTODO: Recarga manual si es necesario ========
  recargarEventos(): void {
    this.cargarEventosDesdeBackend();
  }

  // ======== MÉTODO SIN CAMBIOS: Lógica de aplicación ========
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
>>>>>>> playersBD
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

<<<<<<< HEAD


    aplicarEvento(evento: Evento, player: Player): { aplicado: boolean; descuentoAplicado: boolean; cantidadFinal: number } {        const jugador = player;
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
=======
    this.playerService.updatePlayer(jugador);
    return { aplicado: true, descuentoAplicado, cantidadFinal };
  }
}
>>>>>>> playersBD
