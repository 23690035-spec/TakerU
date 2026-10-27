import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  actualizarTarea,
  crearTarea,
  eliminarTarea,
  obtenerTareas,
} from '../services/taskService';

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const { usuario } = useAuth();
  const userId = usuario ? usuario.id : null;
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    let activo = true;
    if (!userId) {
      setTareas([]);
      setCargando(false);
      return undefined;
    }
    setCargando(true);
    obtenerTareas(userId)
      .then((lista) => {
        if (activo) setTareas(lista);
      })
      .catch(() => {
        if (activo) setTareas([]);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [userId]);

  const crear = useCallback(
    async (datos) => {
      const { lista, tarea } = await crearTarea(userId, datos);
      setTareas(lista);
      return tarea;
    },
    [userId]
  );

  const actualizar = useCallback(
    async (id, cambios) => {
      const { lista, tarea } = await actualizarTarea(userId, id, cambios);
      setTareas(lista);
      return tarea;
    },
    [userId]
  );

  const eliminar = useCallback(
    async (id) => {
      const lista = await eliminarTarea(userId, id);
      setTareas(lista);
    },
    [userId]
  );

  const valor = useMemo(
    () => ({ tareas, cargando, crear, actualizar, eliminar }),
    [tareas, cargando, crear, actualizar, eliminar]
  );

  return <TasksContext.Provider value={valor}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error('useTasks debe usarse dentro de un TasksProvider');
  }
  return ctx;
}
