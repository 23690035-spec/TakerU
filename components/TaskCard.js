import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import {
  ESTADO_COLORES,
  PRIORIDAD_COLORES,
  estaVencida,
  formatearFechaHora,
} from '../utils/taskUtils';

export default function TaskCard({ tarea, onPress, onToggle, onDelete }) {
  const finalizada = tarea.estado === 'Finalizada';
  const vencida = estaVencida(tarea);
  const prioridad = PRIORIDAD_COLORES[tarea.prioridad];
  const estado = ESTADO_COLORES[tarea.estado];

  return (
    <Pressable
      style={({ pressed }) => [styles.tarjeta, pressed && styles.presionada]}
      onPress={() => onPress(tarea)}
      accessibilityRole="button"
      accessibilityLabel={`Editar tarea ${tarea.titulo}`}
    >
      <Pressable
        onPress={() => onToggle(tarea)}
        hitSlop={10}
        style={[styles.check, finalizada && styles.checkActivo]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: finalizada }}
        accessibilityLabel={finalizada ? 'Marcar como pendiente' : 'Marcar como finalizada'}
      >
        {finalizada && <Text style={styles.checkTexto}>✓</Text>}
      </Pressable>

      <View style={styles.cuerpo}>
        <Text style={[styles.titulo, finalizada && styles.tituloTachado]} numberOfLines={2}>
          {tarea.titulo}
        </Text>
        <Text style={styles.materia} numberOfLines={1}>
          {tarea.materia}
        </Text>
        <Text style={[styles.fecha, vencida && styles.fechaVencida]}>
          {vencida ? 'Vencida · ' : ''}
          {formatearFechaHora(tarea.fechaLimite)}
        </Text>
        <View style={styles.etiquetas}>
          <View style={[styles.etiqueta, { backgroundColor: prioridad.bg }]}>
            <Text style={[styles.etiquetaTexto, { color: prioridad.fg }]}>
              Prioridad {tarea.prioridad}
            </Text>
          </View>
          <View style={[styles.etiqueta, { backgroundColor: estado.bg }]}>
            <Text style={[styles.etiquetaTexto, { color: estado.fg }]}>{tarea.estado}</Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={() => onDelete(tarea)}
        hitSlop={10}
        style={styles.eliminar}
        accessibilityRole="button"
        accessibilityLabel={`Eliminar tarea ${tarea.titulo}`}
      >
        <Text style={styles.eliminarTexto}>✕</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  presionada: {
    opacity: 0.85,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkActivo: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkTexto: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cuerpo: {
    flex: 1,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  tituloTachado: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  materia: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  fecha: {
    fontSize: 13,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  fechaVencida: {
    color: colors.error,
    fontWeight: '600',
  },
  etiquetas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  etiqueta: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  etiquetaTexto: {
    fontSize: 11,
    fontWeight: '700',
  },
  eliminar: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  eliminarTexto: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '700',
  },
});
