export interface Sesion {
  id: string;
  nombre: string;
  fechaInicio: number;
  piezas: number;
  duracionSegundos: number;
  piezasTimestamps: number[];
}

export interface SesionActiva {
  fechaInicio: number;
  piezas: number;
  piezasTimestamps: number[];
}
