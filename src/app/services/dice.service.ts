// src/app/services/dice.service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable, interval } from 'rxjs';
import { take, finalize, map } from 'rxjs/operators';

/**
 * Servicio para gestionar la lógica del dado:
 * - Simula animación de giro
 * - Genera resultados aleatorios
 * - Notifica el resultado final a los suscriptores
 */
@Injectable({ providedIn: 'root' })
export class DiceService {
  /** Subject para emitir los resultados del dado */
  private resultSubject = new Subject<number>();
  
  /** Observable público para suscribirse a los resultados */
  result$ = this.resultSubject.asObservable();

  /**
   * Simula el lanzamiento del dado:
   * 1. Emite 15 valores aleatorios rápidos (para efecto visual)
   * 2. El último valor emitido es el resultado final
   */
  roll(): void {
    const spins = 15; // Número de cambios durante la animación
    const min = 1;    // Valor mínimo del dado
    const max = 6;    // Valor máximo del dado
    
    interval(100).pipe(               // Emite cada 100ms
      take(spins),                    // Limita a 15 emisiones
      map(() => Math.floor(Math.random() * (max - min + 1)) + min), // Genera números 1-6
      finalize(() => {
        // Lugar para limpieza (no necesario aquí ya que el Subject se maneja externamente)
      })
    ).subscribe({
      next: (n) => {
        // Emite cada valor intermedio (para animaciones)
        this.resultSubject.next(n);
      },
      complete: () => {
        // Se completa automáticamente tras 15 emisiones
        // El último valor emitido se considera el resultado final
      }
    });
  }
}
