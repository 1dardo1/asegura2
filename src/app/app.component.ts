import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PartidaComponent } from "./paginas/partida/partida.component";
import { InicioComponent } from "./componentes/inicio/inicio.component";
import { PantallaDeTituloComponent } from "./paginas/pantalla-de-titulo/pantalla-de-titulo.component";
import { SalaComponent } from "./paginas/sala/sala.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PartidaComponent, InicioComponent, PantallaDeTituloComponent, SalaComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'asegurados';
}
