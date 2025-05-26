// modal.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private seguroSubject = new Subject<{ player: any, seguro: any }>();
  seguro$ = this.seguroSubject.asObservable();

  solicitarSeguro(player: any, seguro: any) {
    console.log(player,"___", seguro)
    this.seguroSubject.next({ player, seguro });

  }
}
