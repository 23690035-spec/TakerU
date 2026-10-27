import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const USERS_KEY = '@tecsolv_users';
const SESSION_KEY = '@tecsolv_session';

const normalizarEmail = (email) => String(email || '').trim().toLowerCase();

const generarSalt = async () => {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const hashPassword = (password, salt) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + password);

const leerUsuarios = async () => {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
};

const guardarSesion = async (usuario) => {
  const sesion = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    iniciadaEn: new Date().toISOString(),
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
  return sesion;
};

export async function registrarUsuario({ nombre, email, password }) {
  const emailNorm = normalizarEmail(email);
  const usuarios = await leerUsuarios();

  if (usuarios.some((u) => u.email === emailNorm)) {
    throw new Error('Ya existe una cuenta registrada con ese correo.');
  }

  const salt = await generarSalt();
  const passwordHash = await hashPassword(password, salt);
  const nuevo = {
    id: `u_${Date.now()}_${salt.slice(0, 6)}`,
    nombre: String(nombre).trim(),
    email: emailNorm,
    salt,
    passwordHash,
    creadoEn: new Date().toISOString(),
  };

  await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...usuarios, nuevo]));
  return guardarSesion(nuevo);
}

export async function iniciarSesion({ email, password }) {
  const emailNorm = normalizarEmail(email);
  const usuarios = await leerUsuarios();
  const usuario = usuarios.find((u) => u.email === emailNorm);

  if (!usuario) {
    throw new Error('Correo o contraseña incorrectos.');
  }

  const hash = await hashPassword(password, usuario.salt);
  if (hash !== usuario.passwordHash) {
    throw new Error('Correo o contraseña incorrectos.');
  }

  return guardarSesion(usuario);
}

export async function obtenerSesion() {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function cerrarSesion() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
