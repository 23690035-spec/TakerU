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

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);
  const passwordRef = useRef(null);

  const validar = () => {
    const nuevos = {};
    if (!email.trim()) {
      nuevos.email = 'Ingresa tu correo electrónico.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nuevos.email = 'El correo no tiene un formato válido.';
    }
    if (!password) {
      nuevos.password = 'Ingresa tu contraseña.';
    } else if (password.length < 6) {
      nuevos.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const manejarLogin = async () => {
    setErrorGeneral('');
    if (!validar()) return;
    setEnviando(true);
    try {
      await login({ email, password });
    } catch (e) {
      setErrorGeneral(e.message || 'No se pudo iniciar sesión.');
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
        <View style={styles.encabezado}>
          <View style={styles.logo}>
            <Text style={styles.logoTexto}>TS</Text>
          </View>
          <Text style={styles.titulo}>TecSolv</Text>
          <Text style={styles.subtitulo}>Gestión de actividades académicas</Text>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.tituloForm}>Iniciar sesión</Text>

          {!!errorGeneral && (
            <View style={styles.banner}>
              <Text style={styles.bannerTexto}>{errorGeneral}</Text>
            </View>
          )}

          <FormInput
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
            placeholder="Tu contraseña"
            value={password}
            onChangeText={setPassword}
            error={errores.password}
            secure
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={manejarLogin}
          />

          <Pressable
            style={({ pressed }) => [
              styles.boton,
              pressed && styles.botonPresionado,
              enviando && styles.botonDeshabilitado,
            ]}
            onPress={manejarLogin}
            disabled={enviando}
            accessibilityRole="button"
          >
            {enviando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.botonTexto}>Entrar</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Register')}
            style={styles.enlace}
            accessibilityRole="button"
          >
            <Text style={styles.enlaceTexto}>
              ¿No tienes cuenta? <Text style={styles.enlaceResaltado}>Regístrate</Text>
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
  encabezado: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoTexto: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  titulo: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },
  subtitulo: {
    fontSize: 14,
    color: colors.muted,
    marginTop: spacing.xs,
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
