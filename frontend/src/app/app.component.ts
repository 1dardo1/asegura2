import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EventoService } from './services/eventos.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit{
  title = 'asegurados';
  cargando = true;

  constructor(private eventoService: EventoService) {}

  ngOnInit() {
    this.eventoService.inicializarEventos().subscribe({
      next: () => this.cargando = false,
      error: (err) => {
        console.error('Error cargando eventos', err);
        this.cargando = false;
      }
    });
  }
}
