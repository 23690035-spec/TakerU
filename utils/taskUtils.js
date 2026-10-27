export const ESTADOS = ['Pendiente', 'En Progreso', 'Finalizada'];
export const PRIORIDADES = ['Alta', 'Media', 'Baja'];

export const PRIORIDAD_COLORES = {
  Alta: { fg: '#B3261E', bg: '#FDECEA' },
  Media: { fg: '#B26A00', bg: '#FFF4E0' },
  Baja: { fg: '#1E8E3E', bg: '#E6F4EA' },
};

export const ESTADO_COLORES = {
  Pendiente: { fg: '#5B6475', bg: '#ECEEF3' },
  'En Progreso': { fg: '#1E4FD8', bg: '#E4ECFD' },
  Finalizada: { fg: '#1E8E3E', bg: '#E6F4EA' },
};

const PESO_PRIORIDAD = { Alta: 0, Media: 1, Baja: 2 };
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const pad = (n) => String(n).padStart(2, '0');

export const inicioDelDia = (fecha) =>
  new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());

export function formatearFecha(iso) {
  const d = new Date(iso);
  return `${DIAS[d.getDay()]} ${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatearHora(iso) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatearFechaHora(iso) {
  return `${formatearFecha(iso)}, ${formatearHora(iso)}`;
}

export function normalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function estaVencida(tarea) {
  return tarea.estado !== 'Finalizada' && new Date(tarea.fechaLimite).getTime() < Date.now();
}

export function contarPorEstado(tareas) {
  const conteo = { Todas: tareas.length, Pendiente: 0, 'En Progreso': 0, Finalizada: 0 };
  tareas.forEach((t) => {
    if (conteo[t.estado] !== undefined) conteo[t.estado] += 1;
  });
  return conteo;
}

export function filtrarTareas(tareas, { estado = 'Todas', busqueda = '' } = {}) {
  const q = normalizarTexto(busqueda);
  return tareas.filter((t) => {
    if (estado !== 'Todas' && t.estado !== estado) return false;
    if (!q) return true;
    const texto = normalizarTexto(`${t.titulo} ${t.materia} ${t.descripcion}`);
    return texto.includes(q);
  });
}

const ordenarPorFecha = (a, b) => {
  const diff = new Date(a.fechaLimite).getTime() - new Date(b.fechaLimite).getTime();
  if (diff !== 0) return diff;
  return PESO_PRIORIDAD[a.prioridad] - PESO_PRIORIDAD[b.prioridad];
};

export function agruparTareas(tareas) {
  const ahora = new Date();
  const hoy = inicioDelDia(ahora);
  const grupos = {
    Vencidas: [],
    Hoy: [],
    'Mañana': [],
    'Esta semana': [],
    'Más adelante': [],
    Finalizadas: [],
  };

  tareas.forEach((t) => {
    if (t.estado === 'Finalizada') {
      grupos.Finalizadas.push(t);
      return;
    }
    const fecha = new Date(t.fechaLimite);
    if (fecha.getTime() < ahora.getTime()) {
      grupos.Vencidas.push(t);
      return;
    }
    const dias = Math.round((inicioDelDia(fecha).getTime() - hoy.getTime()) / 86400000);
    if (dias <= 0) grupos.Hoy.push(t);
    else if (dias === 1) grupos['Mañana'].push(t);
    else if (dias <= 7) grupos['Esta semana'].push(t);
    else grupos['Más adelante'].push(t);
  });

  const colores = {
    Vencidas: '#B3261E',
    Hoy: '#1E4FD8',
    'Mañana': '#7B3FE4',
    'Esta semana': '#B26A00',
    'Más adelante': '#5B6475',
    Finalizadas: '#1E8E3E',
  };

  return Object.keys(grupos)
    .filter((titulo) => grupos[titulo].length > 0)
    .map((titulo) => ({
      title: titulo,
      color: colores[titulo],
      data:
        titulo === 'Finalizadas'
          ? grupos[titulo].sort((a, b) => ordenarPorFecha(b, a))
          : grupos[titulo].sort(ordenarPorFecha),
    }));
}
