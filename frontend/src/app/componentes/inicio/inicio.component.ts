import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PlayerService } from '../../services/player.service';

@Component({
  selector: 'app-inicio',
  imports: [],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  router = inject(Router);
  playerService = inject(PlayerService);
  uttr: SpeechSynthesisUtterance;

  constructor() {
    this.uttr = new SpeechSynthesisUtterance();
    this.uttr.lang = 'es-ES';
  }

  ngOnInit() {
    localStorage.clear();
  }

  irSala() {
    // Consultar si hay jugadores existentes
    const jugadoresExistentes = this.playerService.getCurrentPlayers();
    
    if (jugadoresExistentes && jugadoresExistentes.length > 0) {
      // Mostrar diálogo de confirmación
      const continuar = confirm('Se encontró una partida existente. ¿Deseas continuar con la partida actual?');
      
      if (continuar) {
        this.continuarPartidaExistente(jugadoresExistentes);
      } else {
        this.empezarNuevaPartida();
      }
    } else {
      // No hay jugadores, ir a sala
      this.irASala();
    }
  }

  private continuarPartidaExistente(jugadores: any[]) {
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
    // Eliminar jugadores y ir a sala
    this.playerService.resetGame();
    this.irASala();
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
