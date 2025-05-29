import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { GameComponent } from "../../componentes/game/game.component";

@Component({
  standalone: true,
  selector: 'app-juego',
  templateUrl: './juego.component.html',
  imports: [CommonModule, GameComponent]
})
export class JuegoComponent {}