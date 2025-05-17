// src/app/services/dice.service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable, interval } from 'rxjs';
import { take, finalize, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DiceService {
  /** Emite el número final del dado tras "girar" */
  private resultSubject = new Subject<number>();
  result$ = this.resultSubject.asObservable();

  /** Lanza el dado: simula 15 cambios rápidos y emite el resultado final */
  roll(): void {
    const spins = 15;
    interval(100).pipe(
      take(spins),
      map(() => Math.floor(Math.random() * 6) + 1),
      finalize(() => {
        // no-op: la última emisión ya ha llegado
      })
    ).subscribe({
      next: (n) => {
        // cada 100 ms emite un valor (puedes suscribirte a esto si quieres animar)
        this.resultSubject.next(n);
      },
      complete: () => {
        // marcado automático al completar los 15 spins
      }
    });
  }
}
