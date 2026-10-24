const ordsRoot = 'https://g06a0176b9b4a08-m82ksr4usxkhxrvn.adb.sa-santiago-1.oraclecloudapps.com/ords/admin';
const gpsLocationsUrl = import.meta.env.VITE_ORDS_LOCATIONS_URL?.trim();

export const ORDS_RESOURCES = [
  { id: 'alerta_combo', label: 'Alerta Combo', description: 'Alertas registradas en el sistema', url: `${ordsRoot}/alerta_combo/` },
  { id: 'alertas_resueltas', label: 'Alertas Resueltas', description: 'Alertas trasladadas al resolverse', url: `${ordsRoot}/alertas_resueltas/` },
  { id: 'auditoria_alertas', label: 'Auditoría Alerta', description: 'Resolución de alertas, responsable y detalles', url: `${ordsRoot}/auditoria_alertas/` },
  { id: 'comuna', label: 'Comuna', description: 'Comunas para asignar a otras entidades', url: `${ordsRoot}/comuna/` },
  { id: 'empleado', label: 'Empleado', description: 'Datos de empleados', url: `${ordsRoot}/empleado/` },
  { id: 'region', label: 'Región', description: 'Regiones para asignar a otras entidades', url: `${ordsRoot}/region/` },
  { id: 'sucursal', label: 'Sucursal', description: 'Sucursales de las empresas', url: `${ordsRoot}/sucursal/` },
  { id: 'vehiculo', label: 'Vehículo', description: 'Vehículos asociados a los empleados', url: `${ordsRoot}/vehiculo/` },
  { id: 'asignacion_turno', label: 'Asignación Turno', description: 'Asignaciones de turnos', url: `${ordsRoot}/asignacion_turno/` },
  { id: 'cargo', label: 'Cargo', description: 'Cargos asignables a empleados', url: `${ordsRoot}/cargo/` },
  { id: 'dispositivo_gps', label: 'Dispositivo GPS', description: 'Dispositivos GPS instalados en vehículos', url: gpsLocationsUrl || null },
  { id: 'empresa_cliente', label: 'Empresa Cliente', description: 'Empresas clientes', url: `${ordsRoot}/empresa_cliente/` },
  { id: 'ruta_planificada', label: 'Ruta Planificada', description: 'Rutas planificadas para turnos', url: `${ordsRoot}/ruta_planificada/` },
  { id: 'tipo_vehiculo', label: 'Tipo Vehículo', description: 'Tipos asignables a vehículos', url: `${ordsRoot}/tipo_vehiculo/` },
];

async function request(resourceId, path = '', options = {}) {
  const resource = ORDS_RESOURCES.find((item) => item.id === resourceId);
  if (!resource?.url) {
    throw new Error('La URL de Dispositivo GPS recibida es la misma que Cargo. Falta la URL AutoREST correcta.');
  }

  const response = await fetch(`${resource.url}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`ORDS ${response.status}: ${details || response.statusText}`);
  }

  if (response.status === 204) return null;
  const responseBody = await response.text();
  return responseBody ? JSON.parse(responseBody) : null;
}

export async function getResourceRows(resourceId) {
  const result = await request(resourceId, '?limit=100');
  return result.items ?? [];
}

export async function resourceRowExists(resourceId, column, value) {
  let offset = 0;
  while (true) {
    const result = await request(resourceId, `?limit=100&offset=${offset}`);
    const rows = result.items ?? [];
    if (rows.some((row) => String(row[column]) === String(value))) return true;
    if (!result.hasMore || rows.length === 0) return false;
    offset += rows.length;
  }
}

export function createResourceRow(resourceId, record) {
  return request(resourceId, '', {
    method: 'POST',
    body: JSON.stringify(record),
  });
}

export function updateResourceRow(resourceId, item, record) {
  const resource = ORDS_RESOURCES.find((entry) => entry.id === resourceId);
  const selfLink = item.links?.find((link) => link.rel === 'self')?.href;
  if (!resource?.url || !selfLink) {
    throw new Error('ORDS no entregó un enlace self para actualizar este registro.');
  }

  const collectionUrl = new URL(resource.url);
  const itemUrl = new URL(selfLink);
  if (itemUrl.origin !== collectionUrl.origin || !itemUrl.pathname.startsWith(collectionUrl.pathname)) {
    throw new Error('El enlace del registro no pertenece a la colección seleccionada.');
  }

  return request(resourceId, itemUrl.pathname.slice(collectionUrl.pathname.length), {
    method: 'PUT',
    body: JSON.stringify(record),
  });
}

export function deleteResourceRow(resourceId, item) {
  const resource = ORDS_RESOURCES.find((entry) => entry.id === resourceId);
  const selfLink = item.links?.find((link) => link.rel === 'self')?.href;
  if (!resource?.url || !selfLink) {
    throw new Error('ORDS no entregó un enlace self para eliminar este registro.');
  }

  const collectionUrl = new URL(resource.url);
  const itemUrl = new URL(selfLink);
  if (itemUrl.origin !== collectionUrl.origin || !itemUrl.pathname.startsWith(collectionUrl.pathname)) {
    throw new Error('El enlace del registro no pertenece a la colección seleccionada.');
  }

  return request(resourceId, itemUrl.pathname.slice(collectionUrl.pathname.length), {
    method: 'DELETE',
  });
}

export async function moveAlertToResolved(alert) {
  const { links: _links, ...columns } = alert;
  const alreadyArchived = await resourceRowExists(
    'alertas_resueltas',
    'id_alerta',
    columns.id_alerta
  );

  if (!alreadyArchived) {
    await createResourceRow('alertas_resueltas', {
      ...columns,
      estado_alerta: 'RESUELTA',
      fecha_resolucion: new Date().toISOString(),
    });
  }

  try {
    await deleteResourceRow('alerta_combo', alert);
  } catch {
    throw new Error('La alerta quedó en ALERTAS_RESUELTAS, pero no se pudo quitar de ALERTA_COMBO. Actualiza y vuelve a intentar.');
  }
}