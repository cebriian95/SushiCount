export interface Sesion {
  id: string;
  nombre: string;
  fechaInicio: number;
  piezas: number;
  duracionSegundos: number;
}

export interface SesionActiva {
  fechaInicio: number;
  piezas: number;
}
