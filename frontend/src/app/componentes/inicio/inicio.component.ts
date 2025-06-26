import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  imports: [],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
router = inject(Router);
uttr : SpeechSynthesisUtterance;

constructor() {
  this.uttr = new SpeechSynthesisUtterance();
  this.uttr.lang = 'es-ES';
}
ngOnInit() {          
  localStorage.clear();
}
irSala(){
  this.router.navigate(['sala']);
  window.speechSynthesis.cancel();
  this.uttr.text = "Selecciona una dificultad";
  window.speechSynthesis.speak(this.uttr);
}
}
