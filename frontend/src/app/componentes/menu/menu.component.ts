import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {

  router = inject(Router);
  uttr : SpeechSynthesisUtterance;

  paso = signal(1);
  numeros = signal([1,2,3,4,5,6,7,8]);
  numerosRecortados = signal<number[] | null>(null);//guarda un array de numeros igual de largo que 
                                                    // la cantidada de jugadores o equipos selecionado

  modoEquiposSeleccionado = signal<boolean|null>(null);
  cantidadDeJugadores = signal<number|null>(null);
  jugadores = signal<string[] | null>(null);
  
  
  cantidadJugadoresSeleccionada = signal<number>(0);
  LinkBackwardIcon: any;
  flag = false;

  ngOnInit() {          
    localStorage.clear();
  }
  constructor() {
    this.uttr = new SpeechSynthesisUtterance();
    this.uttr.lang = 'es-ES';
  }
<<<<<<< HEAD
  botonSetDificultad(value : Dificultad)
  {
    this.dificultadSelecionada.set(value);
    window.speechSynthesis.cancel();
    this.uttr.text = value;
    window.speechSynthesis.speak(this.uttr);
  }
  botonIndividual() {
    this.modoEquiposSeleccionado.set(false);
    window.speechSynthesis.cancel();
=======

  botonIndividual() {
    this.modoEquiposSeleccionado.set(false);
    window.speechSynthesis.cancel(); 
>>>>>>> playersBD
    this.uttr.text = "individual";
    window.speechSynthesis.speak(this.uttr);
  }
  botonEquipos() {
    this.modoEquiposSeleccionado.set(true);
    window.speechSynthesis.cancel();
    this.uttr.text = "equipos";
    window.speechSynthesis.speak(this.uttr);
  }
  asignarValor(value: number) {
    this.cantidadJugadoresSeleccionada.set(value);
    window.speechSynthesis.cancel();
    this.uttr.text = value.toString();
    window.speechSynthesis.speak(this.uttr);
  }
<<<<<<< HEAD
  siguienteDificultadSelecionada() {
    if (this.dificultadSelecionada() != null) {
    this.paso.update(value => value + 1);
    window.speechSynthesis.cancel();
    this.uttr.text = "Elige el modo de juego";
    window.speechSynthesis.speak(this.uttr);
    }else {
      alert("Selecciona una dificultad");
      window.speechSynthesis.cancel();
      this.uttr.text = "Selecciona una dificultad";
      window.speechSynthesis.speak(this.uttr);
    }
  }
=======
  
>>>>>>> playersBD
  siguienteModoSelecionado() {
    if (this.modoEquiposSeleccionado() != null) {
      this.paso.update(value => value + 1);
      if (this.modoEquiposSeleccionado()) {
        window.speechSynthesis.cancel();
        this.uttr.text = "Selecciona la cantidad de equipos";
      }else {
        window.speechSynthesis.cancel();
        this.uttr.text = "Selecciona la cantidad de jugadores";
      }
      window.speechSynthesis.speak(this.uttr);
    }else {
      alert("Selecciona un modo de juego");
      window.speechSynthesis.cancel();
      this.uttr.text = "Selecciona un modo de juego";
      window.speechSynthesis.speak(this.uttr);
    }
  }
  atras() {
    if (this.paso() > 1) {
      this.paso.update(value => value - 1);
    }else {
      this.router.navigate(['pantallaDeTitulo']);
    }
  }
  siguienteCantidadJugadores(value: number) {
    if(value != 0) {
      this.paso.update(value => value + 1);
      this.numerosRecortados.update(() => this.numeros().slice(0, value));
      window.speechSynthesis.cancel();
      this.uttr.text = "Escribid vuestros nombres";
      window.speechSynthesis.speak(this.uttr);
    }else {
      alert("Selecciona una cantidad de jugadores");
      window.speechSynthesis.cancel();
      this.uttr.text = "Selecciona una cantidad de jugadores";
      window.speechSynthesis.speak(this.uttr);
    }

  }
  irPartida() {
    const lista = this.numerosRecortados();
    let jugadoresSinNombre = false;
    let nuevosJugadores: string[] = [];
    if (lista) {
      for (let i = 0; i < lista.length; i++) {
        let numId = i + 1;
        let id = "jugador" + numId;
        let input = document.getElementById(id) as HTMLInputElement;
        let nombre = input?.value || "";
        console.log(nombre);
        if (nombre === "") {
          alert("El jugador " + numId + " no tiene nombre.");
          window.speechSynthesis.cancel();
          this.uttr.text = "Escribid vuestros nombres";
          window.speechSynthesis.speak(this.uttr);
          jugadoresSinNombre = true;
          break;
        } else {
          nuevosJugadores.push(nombre); 
        }
      }
      if (!jugadoresSinNombre) {
        this.jugadores.update((listaActual) => {
          return listaActual ? [...listaActual, ...nuevosJugadores] : nuevosJugadores;
        });
          this.router.navigate(['juego'], { queryParams: {equipos: this.modoEquiposSeleccionado(), cantidadDeJugadores: this.cantidadJugadoresSeleccionada(), jugadores:this.jugadores()} }); 
      }
    }
  }
  
  irPantallaDeTitulo(){
    this.router.navigate(['pantallaDeTitulo']);
  }
}


