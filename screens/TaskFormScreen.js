import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import FormInput from '../components/FormInput';
import { useTasks } from '../context/TasksContext';
import { colors, spacing } from '../theme';
import {
  ESTADOS,
  ESTADO_COLORES,
  PRIORIDADES,
  PRIORIDAD_COLORES,
  formatearFecha,
  formatearHora,
} from '../utils/taskUtils';

const fechaPorDefecto = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(23, 59, 0, 0);
  return d;
};

export default function TaskFormScreen({ navigation, route }) {
  const tareaEditar = route.params && route.params.tarea ? route.params.tarea : null;
  const { crear, actualizar, eliminar } = useTasks();

  const [titulo, setTitulo] = useState(tareaEditar ? tareaEditar.titulo : '');
  const [descripcion, setDescripcion] = useState(tareaEditar ? tareaEditar.descripcion : '');
  const [materia, setMateria] = useState(tareaEditar ? tareaEditar.materia : '');
  const [fecha, setFecha] = useState(
    tareaEditar ? new Date(tareaEditar.fechaLimite) : fechaPorDefecto()
  );
  const [prioridad, setPrioridad] = useState(tareaEditar ? tareaEditar.prioridad : 'Media');
  const [estado, setEstado] = useState(tareaEditar ? tareaEditar.estado : 'Pendiente');
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const materiaRef = useRef(null);
  const descripcionRef = useRef(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: tareaEditar ? 'Editar tarea' : 'Nueva tarea' });
  }, [navigation, tareaEditar]);

  const limpiarError = (campo) => setErrores((prev) => ({ ...prev, [campo]: undefined }));

  const abrirSelectorAndroid = () => {
    DateTimePickerAndroid.open({
      value: fecha,
      mode: 'date',
      onChange: (eventoFecha, fechaElegida) => {
        if (eventoFecha.type !== 'set' || !fechaElegida) return;
        DateTimePickerAndroid.open({
          value: fechaElegida,
          mode: 'time',
          is24Hour: true,
          onChange: (eventoHora, horaElegida) => {
            if (eventoHora.type !== 'set' || !horaElegida) return;
            setFecha(horaElegida);
            limpiarError('fecha');
          },
        });
      },
    });
  };

  const validar = () => {
    const nuevos = {};

    if (!titulo.trim()) {
      nuevos.titulo = 'Ingresa el título de la tarea.';
    } else if (titulo.trim().length < 3) {
      nuevos.titulo = 'El título debe tener al menos 3 caracteres.';
    } else if (titulo.trim().length > 80) {
      nuevos.titulo = 'El título no debe exceder 80 caracteres.';
    }

    if (!materia.trim()) {
      nuevos.materia = 'Ingresa la materia.';
    } else if (materia.trim().length > 60) {
      nuevos.materia = 'La materia no debe exceder 60 caracteres.';
    }

    if (descripcion.trim().length > 500) {
      nuevos.descripcion = 'La descripción no debe exceder 500 caracteres.';
    }

    const esNuevaOReabierta = !tareaEditar || estado !== 'Finalizada';
    if (esNuevaOReabierta && !tareaEditar && fecha.getTime() < Date.now() - 60000) {
      nuevos.fecha = 'La fecha límite no puede estar en el pasado.';
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const guardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    const datos = {
      titulo,
      descripcion,
      materia,
      fechaLimite: fecha.toISOString(),
      prioridad,
      estado,
    };
    try {
      if (tareaEditar) {
        await actualizar(tareaEditar.id, datos);
      } else {
        await crear(datos);
      }
      navigation.goBack();
    } catch (e) {
      setGuardando(false);
      Alert.alert('Error', e.message || 'No se pudo guardar la tarea.');
    }
  };

  const confirmarEliminar = () => {
    Alert.alert('Eliminar tarea', '¿Eliminar esta tarea? Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminar(tareaEditar.id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', e.message || 'No se pudo eliminar la tarea.');
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <FormInput
          label="Título"
          placeholder="Ej. Entregar reporte de la práctica 5"
          value={titulo}
          onChangeText={(t) => {
            setTitulo(t);
            limpiarError('titulo');
          }}
          error={errores.titulo}
          autoCapitalize="sentences"
          maxLength={80}
          returnKeyType="next"
          onSubmitEditing={() => materiaRef.current && materiaRef.current.focus()}
          blurOnSubmit={false}
        />

        <FormInput
          ref={materiaRef}
          label="Materia"
          placeholder="Ej. Programación Funcional"
          value={materia}
          onChangeText={(t) => {
            setMateria(t);
            limpiarError('materia');
          }}
          error={errores.materia}
          autoCapitalize="words"
          maxLength={60}
          returnKeyType="next"
          onSubmitEditing={() => descripcionRef.current && descripcionRef.current.focus()}
          blurOnSubmit={false}
        />

        <FormInput
          ref={descripcionRef}
          label="Descripción (opcional)"
          placeholder="Detalles, requisitos o notas de la tarea"
          value={descripcion}
          onChangeText={(t) => {
            setDescripcion(t);
            limpiarError('descripcion');
          }}
          error={errores.descripcion}
          autoCapitalize="sentences"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
          inputStyle={styles.multilinea}
        />

        <Text style={styles.label}>Fecha y hora límite</Text>
        {Platform.OS === 'android' ? (
          <Pressable
            onPress={abrirSelectorAndroid}
            style={[styles.selectorFecha, !!errores.fecha && styles.selectorError]}
            accessibilityRole="button"
            accessibilityLabel="Elegir fecha y hora límite"
          >
            <Text style={styles.selectorTexto}>{formatearFecha(fecha.toISOString())}</Text>
            <Text style={styles.selectorHora}>{formatearHora(fecha.toISOString())}</Text>
          </Pressable>
        ) : (
          <View style={[styles.selectorFechaIos, !!errores.fecha && styles.selectorError]}>
            <DateTimePicker
              value={fecha}
              mode="datetime"
              display="compact"
              locale="es-MX"
              onChange={(evento, elegida) => {
                if (elegida) {
                  setFecha(elegida);
                  limpiarError('fecha');
                }
              }}
            />
          </View>
        )}
        {!!errores.fecha && <Text style={styles.error}>{errores.fecha}</Text>}

        <Text style={[styles.label, styles.separado]}>Prioridad</Text>
        <View style={styles.fila}>
          {PRIORIDADES.map((p) => {
            const activo = prioridad === p;
            const color = PRIORIDAD_COLORES[p];
            return (
              <Pressable
                key={p}
                onPress={() => setPrioridad(p)}
                style={[
                  styles.opcion,
                  activo && { backgroundColor: color.bg, borderColor: color.fg },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
              >
                <Text style={[styles.opcionTexto, activo && { color: color.fg }]}>{p}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, styles.separado]}>Estado</Text>
        <View style={styles.fila}>
          {ESTADOS.map((e) => {
            const activo = estado === e;
            const color = ESTADO_COLORES[e];
            return (
              <Pressable
                key={e}
                onPress={() => setEstado(e)}
                style={[
                  styles.opcion,
                  activo && { backgroundColor: color.bg, borderColor: color.fg },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
              >
                <Text style={[styles.opcionTexto, activo && { color: color.fg }]}>{e}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.botonGuardar,
            pressed && styles.botonPresionado,
            guardando && styles.botonDeshabilitado,
          ]}
          onPress={guardar}
          disabled={guardando}
          accessibilityRole="button"
        >
          {guardando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.botonGuardarTexto}>
              {tareaEditar ? 'Guardar cambios' : 'Crear tarea'}
            </Text>
          )}
        </Pressable>

        {tareaEditar && (
          <Pressable
            style={styles.botonEliminar}
            onPress={confirmarEliminar}
            disabled={guardando}
            accessibilityRole="button"
          >
            <Text style={styles.botonEliminarTexto}>Eliminar tarea</Text>
          </Pressable>
        )}
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
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  separado: {
    marginTop: spacing.md,
  },
  multilinea: {
    height: 100,
    paddingTop: 12,
  },
  selectorFecha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 14,
  },
  selectorFechaIos: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: 10,
  },
  selectorError: {
    borderColor: colors.error,
  },
  selectorTexto: {
    fontSize: 16,
    color: colors.text,
  },
  selectorHora: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  fila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  opcion: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  opcionTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.muted,
  },
  botonGuardar: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  botonPresionado: {
    backgroundColor: colors.primaryDark,
  },
  botonDeshabilitado: {
    opacity: 0.7,
  },
  botonGuardarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  botonEliminar: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.error,
    marginTop: spacing.md,
  },
  botonEliminarTexto: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
});
