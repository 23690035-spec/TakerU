# TecSolv

App móvil de gestión académica (React Native + Expo). Registro e inicio de sesión, tareas con fecha límite, estado y prioridad, almacenamiento local.

## Descargar e instalar (usuarios)

1. Entra a la pestaña **Releases** de este repositorio.
2. Descarga `TecSolv.apk` de la versión más reciente.
3. Ábrelo en tu Android y permite instalar apps de origen desconocido si te lo pide.

La app avisa sola cuando hay una versión nueva al abrirla.

## Orden para publicar (desarrollador)

1. Crea un repositorio **público** vacío en GitHub (sin README).
2. En una carpeta vacía: `node crear-proyecto.js` y luego `cd tecsolv`.
3. `npm install`
4. `npm run subir -- https://github.com/TU_USUARIO/tecsolv.git`
5. En GitHub: **Settings → Actions → General → Workflow permissions → Read and write permissions**, y guarda.
6. En **Actions**, ejecuta el workflow si no arrancó solo. Al terminar (10-20 min) aparece el APK en **Releases**.

## Publicar actualizaciones

```
npm run actualizar -- "descripción del cambio"
```

Cada push a `main` compila un APK nuevo y crea un release. Quienes ya tienen la app reciben el aviso "Actualización disponible" al abrirla.

## Desarrollo

```
npm install
npx expo start
```

## Notas

- El repositorio debe ser público para que la app consulte los releases.
- Todas las compilaciones se firman igual, así que cada APK se instala encima de la versión anterior sin desinstalar.
- Los datos se guardan en el dispositivo (AsyncStorage) y se conservan al actualizar.
