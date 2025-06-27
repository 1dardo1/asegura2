// src/app/resolvers/players.resolver.ts
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { PlayerService } from '../services/player.service';

@Injectable({ providedIn: 'root' })
export class PlayersResolver implements Resolve<boolean> {
  constructor(private playerService: PlayerService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): boolean {
    // Extrae los nombres de jugadores de la URL
    const jugadoresParam = route.queryParamMap.getAll('jugadores');
    const jugadores = jugadoresParam.length > 0 ? jugadoresParam : [];

    if (!jugadores.length) {
      // Si no hay jugadores, redirige a la sala o muestra error
      this.router.navigate(['/sala']);
      return false;
    }

    // Inicializa los jugadores usando el servicio (solo si no existen)
    this.playerService.initializePlayers(jugadores);
    return true;
  }
}
