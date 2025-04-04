import { Component, signal } from '@angular/core';
import { MenuComponent } from "../../componentes/menu/menu.component";

enum Dificultad{
  FACIL = "facil",
  NORMAL = "normal",
  DIFICIL = "dificil"
};
enum Modo{
  INDIVIDUAL = "individual",
  EQUIPOS = "equipos"
};

@Component({
  selector: 'app-sala',
  imports: [MenuComponent],
  templateUrl: './sala.component.html',
  styleUrl: './sala.component.css'
})
export class SalaComponent {

  dificultad = signal(Dificultad.FACIL);
  modo = signal(Modo.INDIVIDUAL);
  antidadDeJugadores = signal(2);
  jugadores = signal(["Jugador 1", "Jugador 2"]);
}