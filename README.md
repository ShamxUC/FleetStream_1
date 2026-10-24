# React + Vite

## Oracle REST Data Services (AutoREST)

La flota y las alertas vigentes se leen desde `vehiculo` y `alerta_combo`; las resueltas, desde `alertas_resueltas`. La pestaña **Tablas Oracle** permite consultar/crear con `GET`/`POST` y editar con `PUT` por el enlace `self` de ORDS. Al resolver, la app crea la alerta destino con `estado_alerta=RESUELTA` y `fecha_resolucion`, y luego elimina la fila vigente usando su enlace `self`. Si la copia ya existe, un reintento omite el POST para evitar duplicados. El listado de rutas está en `src/services/locationsApi.js`.

El traslado usa dos solicitudes HTTP y no es una transacción Oracle distribuida: la app no intenta borrar el origen si falla el POST. Si el POST tiene éxito y el DELETE falla, la alerta permanecerá en ambas colecciones hasta reintentar; el reintento detecta la copia y vuelve a intentar el borrado.

No se simulan telemetrías ni alertas en memoria. La conexión a `AUDITORIA_ALERTAS` permite consultar/crear desde Tablas Oracle, pero la colección está vacía y no se pudo determinar su estructura; por eso resolver una alerta no inserta una fila de auditoría automáticamente. Para eso se necesita un trigger en Oracle o el DDL/columnas de esa tabla.

Para **Dispositivo GPS**, la URL recibida era idéntica a la de **Cargo**. No se reutiliza por seguridad. Copia la URL AutoREST real de la tabla de GPS, agrégala a `.env` como `VITE_ORDS_LOCATIONS_URL` usando el formato de `.env.example` y reinicia Vite. Sin esa variable, la opción GPS queda deshabilitada.

El GET usa `?limit=100`. Para POST o PUT, ingresa un objeto JSON con los nombres de columnas reales de la tabla; por ejemplo, `{"PATENTE":"ABCD-12","LATITUD":-33.4489,"LONGITUD":-70.6693}` solo aplica si esa tabla tiene esas columnas. ORDS debe permitir el origen de la aplicación en CORS y los permisos necesarios para lectura/escritura.

No agregues `DB_USER`, `DB_PASSWORD`, wallet ni otros secretos con prefijo `VITE_`: Vite publica esas variables en el navegador. Si ORDS exige autenticación, usa un backend intermedio; no pongas credenciales de Oracle en el frontend.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
