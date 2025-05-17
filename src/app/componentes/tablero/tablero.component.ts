import { Component, inject, signal,  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


enum Dificultad{FACIL="FACIL", MEDIA="MEDIA", DIFICIL="DIFICIL"};

@Component({
  selector: 'app-tablero',
  templateUrl: './tablero.component.html',
  styleUrls: ['./tablero.component.css']
})
export class TableroComponent  {
  private route = inject(ActivatedRoute);   Dificultad =Dificultad;
  dificultad = signal<Dificultad|null>(null);
  equipos = signal<boolean|null>(null);
  cantidadDeJugadores = signal<number|null>(null);
  jugadores = signal<string[] | null>(null);

  ngOnInit() {
    this.route.queryParams.subscribe((params: { [key: string]: any })  => {
      this.dificultad.set(params['dificultad']) ;
      this.equipos.set(params['equipos']);
      this.cantidadDeJugadores.set(params['cantidadDeJugadores']); 
      this.jugadores.set(params['jugadores']) ; 
      alert("El juego se ha configurado con las siguientes opciones\ndificultad: "+this.dificultad()+"\nequipos: "+this.equipos()+"\ncantidad de jugadores: "+this.cantidadDeJugadores()+"\njugadores :"+this.jugadores());
    });
  }
}