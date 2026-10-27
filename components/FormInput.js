import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, spacing } from '../theme';

const FormInput = forwardRef(function FormInput(
  { label, error, secure = false, style, inputStyle, ...props },
  ref
) {
  const [visible, setVisible] = useState(false);
  const [enfocado, setEnfocado] = useState(false);

  return (
    <View style={[styles.contenedor, style]}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.campo,
          enfocado && styles.campoEnfocado,
          !!error && styles.campoError,
        ]}
      >
        <TextInput
          ref={ref}
          style={[styles.input, inputStyle]}
          placeholderTextColor={colors.muted}
          secureTextEntry={secure && !visible}
          autoCapitalize="none"
          onFocus={() => setEnfocado(true)}
          onBlur={() => setEnfocado(false)}
          {...props}
        />
        {secure && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Text style={styles.toggle}>{visible ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
});

export default FormInput;

const styles = StyleSheet.create({
  contenedor: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  campoEnfocado: {
    borderColor: colors.primary,
  },
  campoError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.text,
  },
  toggle: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
    marginLeft: spacing.sm,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
