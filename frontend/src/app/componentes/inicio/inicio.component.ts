import { Component, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';
import { Player } from '../../models/player.model';
import { Subject } from 'rxjs';
import { takeUntil, take, delay } from 'rxjs/operators';

@Component({
  selector: 'app-inicio',
  imports: [],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnDestroy {
  router = inject(Router);
  playerService = inject(PlayerService);
  uttr: SpeechSynthesisUtterance;
  
  // Propiedad para manejo de unsubscripciones
  private destroy$ = new Subject<void>();

  constructor() {
    this.uttr = new SpeechSynthesisUtterance();
    this.uttr.lang = 'es-ES';
  }

  ngOnInit() {
    localStorage.clear();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  irSala() {
    // Cargar jugadores desde MongoDB antes de verificar
    this.playerService.reloadPlayersFromBackend();
    
    // Usar suscripción para verificar jugadores existentes
    this.playerService.players$
      .pipe(
        takeUntil(this.destroy$),
        take(1), // Solo tomar el primer valor emitido
        delay(200) // Pequeña pausa para asegurar carga completa
      )
      .subscribe((jugadores: Player[]) => {
        console.log('🔍 Verificando jugadores existentes:', jugadores?.length || 0);
        
        if (jugadores && jugadores.length > 0) {
          const continuar = confirm('Se encontró una partida existente. ¿Deseas continuar con la partida actual?');
          
          if (continuar) {
            this.continuarPartidaExistente(jugadores);
          } else {
            this.empezarNuevaPartida();
          }
        } else {
          console.log('📭 No hay jugadores guardados, ir a sala');
          this.irASala(); 
        }
      });
  }

  private continuarPartidaExistente(jugadores: Player[]) {
    console.log('▶️ Continuando partida con', jugadores.length, 'jugadores');
    
    // Extraer nombres para queryParams
    const nombresJugadores = jugadores.map(jugador => jugador.name);
    
    // Navegar a juego con queryParams (igual que menu.component.ts)
    this.router.navigate(['juego'], {
      queryParams: {
        equipos: false,
        cantidadDeJugadores: jugadores.length,
        jugadores: nombresJugadores
      }
    });
    
    this.uttr.text = "Continuando partida existente";
    window.speechSynthesis.speak(this.uttr);
  }

  private empezarNuevaPartida() {
    console.log('🆕 Empezando nueva partida - eliminando jugadores existentes');
    
    // Eliminar jugadores y ir a sala
    this.playerService.resetGame();
    
    // Pequeña pausa para asegurar que la eliminación se complete
    setTimeout(() => {
      this.irASala();
    }, 300);
  }

  private irASala() {
    this.router.navigate(['sala']);
    this.uttr.text = "Selecciona una dificultad";
    window.speechSynthesis.speak(this.uttr);
  }

  irPantallaDeTitulo() {
    this.router.navigate(['pantallaDeTitulo']);
  }
}