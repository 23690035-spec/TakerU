import AsyncStorage from '@react-native-async-storage/async-storage';

const claveTareas = (userId) => `@tecsolv_tasks_${userId}`;

const generarId = () => `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export async function obtenerTareas(userId) {
  const raw = await AsyncStorage.getItem(claveTareas(userId));
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

const guardarTareas = (userId, lista) =>
  AsyncStorage.setItem(claveTareas(userId), JSON.stringify(lista));

export async function crearTarea(userId, datos) {
  const lista = await obtenerTareas(userId);
  const ahora = new Date().toISOString();
  const tarea = {
    id: generarId(),
    titulo: String(datos.titulo).trim(),
    descripcion: String(datos.descripcion || '').trim(),
    materia: String(datos.materia).trim(),
    fechaLimite: datos.fechaLimite,
    prioridad: datos.prioridad,
    estado: datos.estado || 'Pendiente',
    creadaEn: ahora,
    actualizadaEn: ahora,
  };
  const nueva = [...lista, tarea];
  await guardarTareas(userId, nueva);
  return { lista: nueva, tarea };
}

export async function actualizarTarea(userId, id, cambios) {
  const lista = await obtenerTareas(userId);
  const indice = lista.findIndex((t) => t.id === id);
  if (indice === -1) {
    throw new Error('La tarea ya no existe.');
  }
  const limpios = { ...cambios };
  if (typeof limpios.titulo === 'string') limpios.titulo = limpios.titulo.trim();
  if (typeof limpios.descripcion === 'string') limpios.descripcion = limpios.descripcion.trim();
  if (typeof limpios.materia === 'string') limpios.materia = limpios.materia.trim();

  const tarea = {
    ...lista[indice],
    ...limpios,
    id: lista[indice].id,
    creadaEn: lista[indice].creadaEn,
    actualizadaEn: new Date().toISOString(),
  };
  const nueva = [...lista];
  nueva[indice] = tarea;
  await guardarTareas(userId, nueva);
  return { lista: nueva, tarea };
}

export async function eliminarTarea(userId, id) {
  const lista = await obtenerTareas(userId);
  const nueva = lista.filter((t) => t.id !== id);
  await guardarTareas(userId, nueva);
  return nueva;
}
