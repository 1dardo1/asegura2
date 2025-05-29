// En modal.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private seguroSubject = new Subject<{ player: any, seguro: any }>();
  seguro$ = this.seguroSubject.asObservable();

  // 1. Inicializa correctamente el Subject para errores
  private errorSubject = new Subject<{ message: string, type: 'error' | 'info' }>();
  error$ = this.errorSubject.asObservable();

  solicitarSeguro(player: any, seguro: any) {
    console.log(player,"___", seguro);
    this.seguroSubject.next({ player, seguro });
  } // <-- 2. Asegúrate de cerrar el método correctamente

  // 3. Método para errores

  showErrorModal(message: string, type: 'error' | 'info' = 'error') {
    this.errorSubject.next({ message, type });
  }
}
