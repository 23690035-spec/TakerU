import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FormInput from '../components/FormInput';
import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function RegisterScreen({ navigation }) {
  const { registro } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmarRef = useRef(null);

  const validar = () => {
    const nuevos = {};

    if (!nombre.trim()) {
      nuevos.nombre = 'Ingresa tu nombre.';
    } else if (nombre.trim().length < 3) {
      nuevos.nombre = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!email.trim()) {
      nuevos.email = 'Ingresa tu correo electrónico.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nuevos.email = 'El correo no tiene un formato válido.';
    }

    if (!password) {
      nuevos.password = 'Ingresa una contraseña.';
    } else if (password.length < 8) {
      nuevos.password = 'La contraseña debe tener al menos 8 caracteres.';
    } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      nuevos.password = 'Debe incluir al menos una letra y un número.';
    }

    if (!confirmar) {
      nuevos.confirmar = 'Confirma tu contraseña.';
    } else if (confirmar !== password) {
      nuevos.confirmar = 'Las contraseñas no coinciden.';
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const manejarRegistro = async () => {
    setErrorGeneral('');
    if (!validar()) return;
    setEnviando(true);
    try {
      await registro({ nombre, email, password });
    } catch (e) {
      setErrorGeneral(e.message || 'No se pudo crear la cuenta.');
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.tarjeta}>
          <Text style={styles.tituloForm}>Crear cuenta</Text>
          <Text style={styles.descripcion}>
            Regístrate para organizar tus tareas y fechas de entrega.
          </Text>

          {!!errorGeneral && (
            <View style={styles.banner}>
              <Text style={styles.bannerTexto}>{errorGeneral}</Text>
            </View>
          )}

          <FormInput
            label="Nombre completo"
            placeholder="Tu nombre"
            value={nombre}
            onChangeText={setNombre}
            error={errores.nombre}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current && emailRef.current.focus()}
            blurOnSubmit={false}
          />

          <FormInput
            ref={emailRef}
            label="Correo electrónico"
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            error={errores.email}
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current && passwordRef.current.focus()}
            blurOnSubmit={false}
          />

          <FormInput
            ref={passwordRef}
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChangeText={setPassword}
            error={errores.password}
            secure
            autoComplete="new-password"
            returnKeyType="next"
            onSubmitEditing={() => confirmarRef.current && confirmarRef.current.focus()}
            blurOnSubmit={false}
          />

          <FormInput
            ref={confirmarRef}
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            value={confirmar}
            onChangeText={setConfirmar}
            error={errores.confirmar}
            secure
            autoComplete="new-password"
            returnKeyType="done"
            onSubmitEditing={manejarRegistro}
          />

          <Pressable
            style={({ pressed }) => [
              styles.boton,
              pressed && styles.botonPresionado,
              enviando && styles.botonDeshabilitado,
            ]}
            onPress={manejarRegistro}
            disabled={enviando}
            accessibilityRole="button"
          >
            {enviando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.botonTexto}>Crear cuenta</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.enlace}
            accessibilityRole="button"
          >
            <Text style={styles.enlaceTexto}>
              ¿Ya tienes cuenta? <Text style={styles.enlaceResaltado}>Inicia sesión</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  tarjeta: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  tituloForm: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  descripcion: {
    fontSize: 13,
    color: colors.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  banner: {
    backgroundColor: colors.errorBg,
    borderRadius: 8,
    padding: spacing.sm + 2,
    marginBottom: spacing.md,
  },
  bannerTexto: {
    color: colors.error,
    fontSize: 13,
  },
  boton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  botonPresionado: {
    backgroundColor: colors.primaryDark,
  },
  botonDeshabilitado: {
    opacity: 0.7,
  },
  botonTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  enlace: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
  },
  enlaceTexto: {
    color: colors.muted,
    fontSize: 14,
  },
  enlaceResaltado: {
    color: colors.primary,
    fontWeight: '700',
  },
});
