import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  cerrarSesion,
  iniciarSesion,
  obtenerSesion,
  registrarUsuario,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const sesion = await obtenerSesion();
        if (activo) setUsuario(sesion);
      } catch (e) {
        if (activo) setUsuario(null);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const login = useCallback(async (datos) => {
    const sesion = await iniciarSesion(datos);
    setUsuario(sesion);
  }, []);

  const registro = useCallback(async (datos) => {
    const sesion = await registrarUsuario(datos);
    setUsuario(sesion);
  }, []);

  const logout = useCallback(async () => {
    await cerrarSesion();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, cargando, login, registro, logout }),
    [usuario, cargando, login, registro, logout]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return ctx;
}
