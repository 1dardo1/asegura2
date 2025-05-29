import { Routes } from '@angular/router';
import { PantallaDeTituloComponent } from './paginas/pantalla-de-titulo/pantalla-de-titulo.component';
import { PartidaComponent } from './paginas/partida/partida.component';
import { SalaComponent } from './paginas/sala/sala.component';
import { JuegoComponent } from './paginas/juego/juego.component';




export const routes: Routes = [
    {
        path: '', 
        component: PantallaDeTituloComponent
    },
    {
        path: 'pantallaDeTitulo',
        component: PantallaDeTituloComponent
    },
    {
        path: 'partida', 
        component: PartidaComponent
    },
    {
        path: 'sala', 
        component: SalaComponent
    },
    { 
        path: 'juego', 
        component: JuegoComponent 
    },
    {
        path: '**', 
        component: PantallaDeTituloComponent
    }
   

];
