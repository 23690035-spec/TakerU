import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TasksContext';
import { colors, spacing } from '../theme';
import { agruparTareas, contarPorEstado, estaVencida, filtrarTareas } from '../utils/taskUtils';

const FILTROS = ['Todas', 'Pendiente', 'En Progreso', 'Finalizada'];

export default function HomeScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const { tareas, cargando, actualizar, eliminar } = useTasks();
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState('Todas');

  const confirmarSalida = useCallback(() => {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar tu sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => logout() },
    ]);
  }, [logout]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={confirmarSalida} hitSlop={10} accessibilityRole="button">
          <Text style={styles.salir}>Salir</Text>
        </Pressable>
      ),
    });
  }, [navigation, confirmarSalida]);

  const conteo = useMemo(() => contarPorEstado(tareas), [tareas]);
  const vencidas = useMemo(() => tareas.filter(estaVencida).length, [tareas]);
  const secciones = useMemo(
    () => agruparTareas(filtrarTareas(tareas, { estado: filtro, busqueda })),
    [tareas, filtro, busqueda]
  );

  const abrirFormulario = (tarea) => navigation.navigate('TaskForm', tarea ? { tarea } : {});

  const alternarEstado = async (tarea) => {
    try {
      await actualizar(tarea.id, {
        estado: tarea.estado === 'Finalizada' ? 'Pendiente' : 'Finalizada',
      });
    } catch (e) {
      Alert.alert('Error', e.message || 'No se pudo actualizar la tarea.');
    }
  };

  const confirmarEliminar = (tarea) => {
    Alert.alert('Eliminar tarea', `¿Eliminar "${tarea.titulo}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminar(tarea.id);
          } catch (e) {
            Alert.alert('Error', e.message || 'No se pudo eliminar la tarea.');
          }
        },
      },
    ]);
  };

  const hayFiltros = filtro !== 'Todas' || busqueda.trim().length > 0;

  const encabezado = (
    <View>
      <Text style={styles.saludo}>Hola, {usuario ? usuario.nombre.split(' ')[0] : ''}</Text>
      <View style={styles.resumen}>
        <View style={styles.resumenItem}>
          <Text style={styles.resumenNumero}>{conteo.Pendiente + conteo['En Progreso']}</Text>
          <Text style={styles.resumenTexto}>Activas</Text>
        </View>
        <View style={styles.resumenItem}>
          <Text style={[styles.resumenNumero, vencidas > 0 && { color: colors.error }]}>
            {vencidas}
          </Text>
          <Text style={styles.resumenTexto}>Vencidas</Text>
        </View>
        <View style={styles.resumenItem}>
          <Text style={[styles.resumenNumero, { color: colors.success }]}>{conteo.Finalizada}</Text>
          <Text style={styles.resumenTexto}>Finalizadas</Text>
        </View>
      </View>

      <TextInput
        style={styles.buscador}
        placeholder="Buscar por título, materia o descripción"
        placeholderTextColor={colors.muted}
        value={busqueda}
        onChangeText={setBusqueda}
        returnKeyType="search"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtros}
        keyboardShouldPersistTaps="handled"
      >
        {FILTROS.map((f) => {
          const activo = filtro === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFiltro(f)}
              style={[styles.chip, activo && styles.chipActivo]}
              accessibilityRole="button"
              accessibilityState={{ selected: activo }}
            >
              <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
                {f} ({conteo[f]})
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.contenedor}>
      {cargando ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <SectionList
          sections={secciones}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={encabezado}
          stickySectionHeadersEnabled={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.lista}
          renderSectionHeader={({ section }) => (
            <View style={styles.seccion}>
              <View style={[styles.seccionPunto, { backgroundColor: section.color }]} />
              <Text style={[styles.seccionTitulo, { color: section.color }]}>{section.title}</Text>
              <Text style={styles.seccionConteo}>{section.data.length}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TaskCard
              tarea={item}
              onPress={abrirFormulario}
              onToggle={alternarEstado}
              onDelete={confirmarEliminar}
            />
          )}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <Text style={styles.vacioTitulo}>
                {hayFiltros ? 'Sin resultados' : 'Aún no tienes tareas'}
              </Text>
              <Text style={styles.vacioTexto}>
                {hayFiltros
                  ? 'Prueba con otra búsqueda o cambia el filtro.'
                  : 'Toca el botón + para registrar tu primera tarea académica.'}
              </Text>
            </View>
          }
        />
      )}

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPresionado]}
        onPress={() => abrirFormulario(null)}
        accessibilityRole="button"
        accessibilityLabel="Crear nueva tarea"
      >
        <Text style={styles.fabTexto}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lista: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  salir: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  saludo: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  resumen: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  resumenItem: {
    flex: 1,
    alignItems: 'center',
  },
  resumenNumero: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  resumenTexto: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  buscador: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    height: 46,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
  },
  filtros: {
    paddingVertical: spacing.md,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  chipTextoActivo: {
    color: '#FFFFFF',
  },
  seccion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  seccionPunto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  seccionTitulo: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  seccionConteo: {
    fontSize: 12,
    color: colors.muted,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  vacio: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  vacioTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  vacioTexto: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fabPresionado: {
    backgroundColor: colors.primaryDark,
  },
  fabTexto: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '400',
  },
});
