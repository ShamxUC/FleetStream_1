import React, { useState, useEffect } from 'react';
import { 
  Car, ShieldAlert, Cpu, Database, Activity,
  CheckCircle, AlertTriangle, Search, Play, Terminal, Server, Radio, RefreshCw, Send, Pencil, X
} from 'lucide-react';
import { createResourceRow, getResourceRows, moveAlertToResolved, ORDS_RESOURCES } from './services/locationsApi';

const readField = (record, field) => record?.[field] ?? record?.[field.toUpperCase()] ?? '-';

export default function App() {
  const [activeTab, setActiveTab] = useState('fleet');
  const [ordsStatus, setOrdsStatus] = useState('CONNECTING');
  const [selectedResource, setSelectedResource] = useState('alerta_combo');
  const [resourceRows, setResourceRows] = useState([]);
  const [resourceError, setResourceError] = useState('');
  const [recordJson, setRecordJson] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const currentResource = ORDS_RESOURCES.find((resource) => resource.id === selectedResource);
  const resourceColumns = Object.keys(resourceRows[0] ?? {}).filter((column) => column !== 'links');

  const refreshResource = async () => {
    setResourceError('');
    setOrdsStatus('CONNECTING');

    try {
      const records = await getResourceRows(selectedResource);
      setResourceRows(records);
      setOrdsStatus('CONNECTED');
    } catch (error) {
      setOrdsStatus('ERROR');
      setResourceError(error.message);
    }
  };

  useEffect(() => {
    getResourceRows(selectedResource)
      .then((records) => {
        setResourceRows(records);
        setOrdsStatus('CONNECTED');
      })
      .catch((error) => {
        setOrdsStatus('ERROR');
        setResourceError(error.message);
      });
  }, [selectedResource]);

  const submitRecord = async (event) => {
    event.preventDefault();
    setIsSavingRecord(true);
    setResourceError('');

    try {
      const record = JSON.parse(recordJson);
      if (!record || typeof record !== 'object' || Array.isArray(record)) {
        throw new Error('El JSON debe ser un objeto con las columnas de la tabla.');
      }
      if (editingRecord) {
        await updateResourceRow(selectedResource, editingRecord, record);
      } else {
        await createResourceRow(selectedResource, record);
      }
      setRecordJson('');
      setEditingRecord(null);
      await refreshResource();
    } catch (error) {
      setOrdsStatus('ERROR');
      setResourceError(error.message);
    } finally {
      setIsSavingRecord(false);
    }
  };

  const [fleetList, setFleetList] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [resolvedAlerts, setResolvedAlerts] = useState([]);
  const [alertView, setAlertView] = useState('vigentes');
  const [masterDataError, setMasterDataError] = useState('');
  const [resolvingAlertId, setResolvingAlertId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getResourceRows('vehiculo'),
      getResourceRows('empleado'),
      getResourceRows('asignacion_turno'),
      getResourceRows('alerta_combo'),
      getResourceRows('alertas_resueltas'),
    ])
      .then(([vehicles, employeeRows, assignmentRows, alertRows, resolvedRows]) => {
        if (cancelled) return;
        setFleetList(vehicles);
        setEmployees(employeeRows);
        setAssignments(assignmentRows);
        setAlerts(alertRows);
        setResolvedAlerts(resolvedRows);
      })
      .catch((error) => {
        if (!cancelled) setMasterDataError(error.message);
      });
    return () => { cancelled = true; };
  }, []);

  const refreshMasterData = async () => {
    try {
      const [vehicles, employeeRows, assignmentRows, alertRows, resolvedRows] = await Promise.all([
        getResourceRows('vehiculo'),
        getResourceRows('empleado'),
        getResourceRows('asignacion_turno'),
        getResourceRows('alerta_combo'),
        getResourceRows('alertas_resueltas'),
      ]);
      setFleetList(vehicles);
      setEmployees(employeeRows);
      setAssignments(assignmentRows);
      setAlerts(alertRows);
      setResolvedAlerts(resolvedRows);
      setMasterDataError('');
    } catch (error) {
      setMasterDataError(error.message);
    }
  };

  const getVehicleDrivers = (vehicle) => assignments
    .filter((assignment) => String(readField(assignment, 'id_vehiculo')) === String(readField(vehicle, 'id_vehiculo')))
    .map((assignment) => ({
      employee: employees.find((employee) => String(readField(employee, 'run')) === String(readField(assignment, 'run'))),
      shift: readField(assignment, 'turno'),
    }))
    .filter(({ employee }) => employee);
  const filteredFleet = fleetList.filter((item) => {
    const driversText = getVehicleDrivers(item).map(({ employee }) => employee).map((employee) =>
      ['pnombre', 'snombre', 'appaterno', 'apmaterno'].map((field) => readField(employee, field)).join(' ')
    ).join(' ');
    return `${JSON.stringify(item)} ${driversText}`.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const filteredEmployees = employees.filter((employee) =>
    JSON.stringify(employee).toLowerCase().includes(searchTerm.toLowerCase())
  );
  const isResolvedAlert = (alert) =>
    ['RESUELTA', 'RESUELTO', 'CERRADA', 'CERRADO'].includes(
      String(readField(alert, 'estado_alerta')).toUpperCase()
    );
  const pendingAlerts = alerts.filter((alert) => !isResolvedAlert(alert));
  const resolvedAlertRows = resolvedAlerts;
  const visibleAlerts = alertView === 'vigentes' ? pendingAlerts : resolvedAlertRows;
  const dashboardAlertMap = new Map(
    [...pendingAlerts, ...resolvedAlertRows].map((alert) => [
      String(readField(alert, 'id_alerta')),
      alert,
    ])
  );
  const dashboardAlerts = [...dashboardAlertMap.values()];
  const criticalAlerts = pendingAlerts.filter((alert) =>
    ['CRITICA', 'CRÍTICA', 'ALTA'].includes(String(readField(alert, 'prioridad')).toUpperCase())
  );

  const resolveAlert = async (alert) => {
    setResolvingAlertId(alert.id_alerta ?? alert.ID_ALERTA);
    setMasterDataError('');
    try {
      await moveAlertToResolved(alert);
      await refreshMasterData();
    } catch (error) {
      await refreshMasterData();
      setMasterDataError(error.message);
    } finally {
      setResolvingAlertId(null);
    }
  };

  // Ejecutor de scripts PL/SQL en consola
  const runPLSQLProcedure = () => {
    setTerminalOutput([
      'No se ejecutó PL/SQL: estas rutas AutoREST exponen tablas, no procedimientos almacenados.',
      'Publica el procedimiento como un módulo ORDS REST para poder invocarlo desde la aplicación.',
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-cyan-600 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20">
            <Radio className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              FleetStream IoT
            </h1>
            <p className="text-xs text-slate-400">Sistema Telemático & Gestión de Flotas PL/SQL Oracle Cloud</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <Server className={`w-4 h-4 ${ordsStatus === 'CONNECTED' ? 'text-emerald-400' : ordsStatus === 'ERROR' ? 'text-rose-400' : 'text-amber-400'}`} />
            <span className="text-slate-400">Oracle Cloud ORDS:</span>
            <span className={`font-semibold ${ordsStatus === 'CONNECTED' ? 'text-emerald-400' : ordsStatus === 'ERROR' ? 'text-rose-400' : 'text-amber-400'}`}>{ordsStatus}</span>
          </div>

          <button
            onClick={refreshMasterData}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Actualizar datos
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col gap-2">
          <div className="text-xs font-bold text-slate-500 uppercase px-3 mb-1 tracking-wider">Módulos del Sistema</div>
          
          <button 
            onClick={() => {
              setActiveTab('dashboard');
              refreshMasterData();
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'dashboard' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Telemetría & Monitor
          </button>

          <button 
            onClick={() => setActiveTab('fleet')}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'fleet' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Car className="w-4 h-4" /> Flotas y Conductores
            </div>
            <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
              {fleetList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('locations')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'locations' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
              <Database className="w-4 h-4" /> Tablas Oracle
          </button>

          <button 
            onClick={() => setActiveTab('plsql')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'plsql' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" /> Runner PL/SQL Oracle
          </button>

          <button 
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'alerts' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4" /> Centro de Alertas
            </div>
            {alerts.filter(a => a.estado === 'PENDIENTE').length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {alerts.filter(a => a.estado === 'PENDIENTE').length}
              </span>
            )}
          </button>

          <div className="mt-auto border-t border-slate-800/80 pt-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <Database className="w-4 h-4" /> Autonomous DB
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                ORDS AutoREST: {ordsStatus}. No se envían credenciales desde el navegador.
              </p>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Flota Total Registrada</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{fleetList.length} Vehículos</h3>
                    <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Leídos desde Oracle
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                    <Car className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Alertas en monitor</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{dashboardAlerts.length}</h3>
                    <p className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
                      <Radio className="w-3 h-3" /> ALERTA_COMBO
                    </p>
                  </div>
                  <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                    <Cpu className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Alertas Críticas</p>
                    <h3 className="text-2xl font-bold text-white mt-1">
                      {criticalAlerts.length} Activas
                    </h3>
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Requieren atención
                    </p>
                  </div>
                  <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400 border border-rose-500/20">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Base de Datos Oracle</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{ORDS_RESOURCES.filter((resource) => resource.url).length} colecciones</h3>
                    <p className="text-[11px] text-indigo-400 mt-1 flex items-center gap-1">
                      <Database className="w-3 h-3" /> AutoREST Oracle
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                    <Server className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Live Telemetry Ping Stream */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-cyan-400" /> Alertas recientes desde Oracle
                    </h2>
                    <p className="text-xs text-slate-400">Datos leídos de ALERTA_COMBO</p>
                  </div>
                  <button onClick={refreshMasterData} className="text-xs text-cyan-300 hover:text-white">Actualizar</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Tipo</th>
                        <th className="p-3">Prioridad</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Fecha</th>
                        <th className="p-3">Descripción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {dashboardAlerts.slice(0, 6).map((alert, index) => (
                        <tr key={alert.id_alerta ?? alert.ID_ALERTA ?? index} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-3 font-mono text-cyan-400">{readField(alert, 'id_alerta')}</td>
                          <td className="p-3">{readField(alert, 'tipo_alerta')}</td>
                          <td className="p-3">{readField(alert, 'prioridad')}</td>
                          <td className="p-3">{readField(alert, 'estado_alerta')}</td>
                          <td className="p-3 text-slate-400">{readField(alert, 'fecha')}</td>
                          <td className="p-3">{readField(alert, 'descripcion')}</td>
                        </tr>
                      ))}
                      {dashboardAlerts.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500">No hay alertas para mostrar.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fleet' && (
            <div className="space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Car className="w-5 h-5 text-cyan-400" /> Catálogo Maestro de Flotas y Asignaciones ({fleetList.length} Registros)
                    </h2>
                    <p className="text-xs text-slate-400">Datos administrados en las entidades del esquema Oracle Cloud</p>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Buscar patente, conductor, empresa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-64"
                      />
                    </div>

                    <button onClick={refreshMasterData} className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 hover:border-cyan-500/50">
                      <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                    </button>
                  </div>
                </div>

                {masterDataError && <p role="alert" className="mb-4 text-xs text-rose-300">No se pudo actualizar desde Oracle: {masterDataError}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFleet.map((v, i) => (
                    <div key={readField(v, 'id_vehiculo') ?? i} className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition-all">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm tracking-wide font-mono bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                            {readField(v, 'patente')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">ID {readField(v, 'id_vehiculo')}</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="text-slate-200 font-semibold">{readField(v, 'marca')} {readField(v, 'modelo')} ({readField(v, 'anio')})</p>
                        <p className="text-slate-400">Sucursal ID: <span className="text-slate-200 font-medium">{readField(v, 'id_sucursal')}</span></p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 space-y-1 text-[11px]">
                        <p className="text-cyan-400/90 font-medium">Tipo de vehículo ID: <span className="text-slate-400">{readField(v, 'id_tipo_vehiculo')}</span></p>
                        <p className="text-cyan-400/90 font-medium">Conductores ({getVehicleDrivers(v).length})</p>
                        <div className="space-y-0.5">
                          {getVehicleDrivers(v).map(({ employee, shift }, driverIndex) => (
                            <p key={`${readField(employee, 'run')}-${driverIndex}`} className="text-slate-400">
                              {['pnombre', 'snombre', 'appaterno', 'apmaterno'].map((field) => readField(employee, field)).filter((value) => value !== '-').join(' ')} · {shift}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredFleet.length === 0 && !masterDataError && (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No se encontraron vehículos que coincidan con los criterios de búsqueda.
                  </div>
                )}

                <section className="mt-8 border-t border-slate-800 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">Conductores ({employees.length})</h3>
                      <p className="text-xs text-slate-400 mt-1">Empleados cargados desde Oracle</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-3">RUN</th>
                          <th className="p-3">Conductor</th>
                          <th className="p-3">Cargo ID</th>
                          <th className="p-3">Sucursal ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {filteredEmployees.map((employee, index) => (
                          <tr key={`${readField(employee, 'run')}-${index}`}>
                            <td className="p-3 font-mono">{readField(employee, 'run')}-{readField(employee, 'dv')}</td>
                            <td className="p-3 font-medium text-white">{['pnombre', 'snombre', 'appaterno', 'apmaterno'].map((field) => readField(employee, field)).filter((value) => value !== '-').join(' ')}</td>
                            <td className="p-3">{readField(employee, 'id_cargo')}</td>
                            <td className="p-3">{readField(employee, 'id_sucursal')}</td>
                          </tr>
                        ))}
                        {filteredEmployees.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-slate-500">No hay conductores que coincidan con la búsqueda.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <label className="text-xs text-slate-400 space-y-1.5 w-full lg:max-w-sm">
                  <span>Tabla AutoREST</span>
                  <select
                    value={selectedResource}
                    onChange={(event) => {
                      setSelectedResource(event.target.value);
                      setResourceError('');
                      setOrdsStatus('CONNECTING');
                      setEditingRecord(null);
                      setRecordJson('');
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  >
                    {ORDS_RESOURCES.map((resource) => (
                      <option key={resource.id} value={resource.id}>{resource.label}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={refreshResource}
                  disabled={!currentResource?.url || ordsStatus === 'CONNECTING'}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${ordsStatus === 'CONNECTING' ? 'animate-spin' : ''}`} />
                  Consultar tabla
                </button>
              </div>

              <p className="text-xs text-slate-400">{currentResource?.description}. Se consultan hasta 100 filas.</p>

              {!currentResource?.url && (
                <div className="border border-amber-500/30 bg-amber-500/10 rounded-lg px-4 py-3 text-xs text-amber-200">
                  La URL que recibimos para Dispositivo GPS es la misma de Cargo. No se enviarán solicitudes a esa ruta. Reemplázala por la URL AutoREST de la tabla de GPS.
                </div>
              )}

              {resourceError && (
                <div role="alert" className="border border-rose-500/30 bg-rose-500/10 rounded-lg px-4 py-3 text-xs text-rose-200">
                  Error ORDS: {resourceError}. Verifica la URL, los permisos de la tabla y CORS.
                </div>
              )}

              <form onSubmit={submitRecord} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <label className="block text-xs text-slate-400 space-y-1.5">
                  <span>{editingRecord ? 'Editar' : 'Nuevo'} registro JSON para {currentResource?.label}</span>
                  <textarea
                    required
                    rows={5}
                    value={recordJson}
                    onChange={(event) => setRecordJson(event.target.value)}
                    placeholder={'{\n  "NOMBRE_COLUMNA": "valor"\n}'}
                    className="w-full resize-y bg-slate-950 border border-slate-700 rounded-md px-3 py-2 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </label>
                <button
                  type="submit"
                  disabled={!currentResource?.url || isSavingRecord}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-xs font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" /> {isSavingRecord ? 'Guardando...' : editingRecord ? 'Guardar cambios' : 'Crear registro'}
                </button>
                {editingRecord && (
                  <button type="button" onClick={() => { setEditingRecord(null); setRecordJson(''); }} className="ml-2 inline-flex items-center gap-1.5 px-3 py-2 text-xs text-slate-300 hover:text-white">
                    <X className="w-3.5 h-3.5" /> Cancelar edición
                  </button>
                )}
              </form>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-800 text-xs text-slate-400">
                  {ordsStatus === 'CONNECTING' ? 'Consultando...' : `${resourceRows.length} registros recibidos`}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        {resourceColumns.map((column) => (
                          <th key={column} className="p-3">{column}</th>
                        ))}
                        <th className="p-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {ordsStatus === 'CONNECTED' && resourceRows.map((row, index) => (
                        <tr key={row.ID ?? row.id ?? index}>
                          {resourceColumns.map((column) => {
                            const value = row[column];
                            return <td key={column} className="max-w-xs p-3 align-top break-words">
                              {value === null || value === undefined ? '-' : typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </td>;
                          })}
                          <td className="p-3 align-top">
                            <button
                              type="button"
                              title="Editar registro"
                              onClick={() => {
                                const { links: _links, ...columns } = row;
                                setEditingRecord(row);
                                setRecordJson(JSON.stringify(columns, null, 2));
                              }}
                              className="p-1.5 text-slate-400 hover:text-cyan-300"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {ordsStatus === 'CONNECTED' && resourceRows.length === 0 && (
                        <tr><td colSpan={(resourceColumns.length || 1) + 1} className="p-8 text-center text-slate-500">La tabla no tiene registros.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plsql' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                  <Terminal className="w-5 h-5 text-cyan-400" /> Procedimientos PL/SQL no conectados
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  AutoREST habilita operaciones sobre tablas; estos procedimientos no tienen un módulo REST configurado y no se ejecutarán desde aquí.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <button 
                    onClick={() => runPLSQLProcedure('generate_employee_report')}
                    className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all text-left group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">generate_employee_report</p>
                      <p className="text-[10px] text-slate-500">Procedimiento con Cursores SQL y DBMS_OUTPUT</p>
                    </div>
                    <Play className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </button>

                  <button 
                    onClick={() => runPLSQLProcedure('pkg_fleetstream.actualizar_estado_gps')}
                    className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all text-left group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">pkg_fleetstream.actualizar</p>
                      <p className="text-[10px] text-slate-500">Package + Trigger Auditoría DML</p>
                    </div>
                    <Play className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </button>

                  <button 
                    onClick={() => runPLSQLProcedure('RECORD_VARRAY_DEMO')}
                    className="flex items-center justify-between p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl transition-all text-left group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">Demostración RECORD / VARRAY</p>
                      <p className="text-[10px] text-slate-500">Colecciones compuestas en bloques anónimos</p>
                    </div>
                    <Play className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  </button>
                </div>

                {/* Terminal Window */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 min-h-[220px]">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-2"><Terminal className="w-3.5 h-3.5" /> Output DBMS_OUTPUT.PUT_LINE</span>
                    <span>Oracle Autonomous DB 21c</span>
                  </div>

                  {terminalOutput.length === 0 ? (
                    <p className="text-slate-600 italic">Para ejecutar procedimientos, publica un handler REST protegido en ORDS. Ninguna operación PL/SQL se ejecuta desde esta pantalla.</p>
                  ) : (
                    <div className="space-y-1">
                      {terminalOutput.map((line, i) => (
                        <p key={i} className={line.includes('TICKET') ? 'text-amber-400 font-bold' : line.includes('completed') ? 'text-emerald-400' : 'text-slate-300'}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" /> Centro de Control de Alertas y Excepciones
                </h2>
                <div className="flex items-center gap-3">
                  <div role="tablist" aria-label="Filtrar alertas" className="flex border border-slate-700 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={alertView === 'vigentes'}
                      onClick={() => setAlertView('vigentes')}
                      className={`px-3 py-2 text-xs font-semibold ${alertView === 'vigentes' ? 'bg-cyan-600/20 text-cyan-300' : 'text-slate-400 hover:text-white'}`}
                    >
                      Vigentes ({pendingAlerts.length})
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={alertView === 'resueltas'}
                      onClick={() => setAlertView('resueltas')}
                      className={`px-3 py-2 text-xs font-semibold border-l border-slate-700 ${alertView === 'resueltas' ? 'bg-emerald-600/20 text-emerald-300' : 'text-slate-400 hover:text-white'}`}
                    >
                      Resueltas ({resolvedAlertRows.length})
                    </button>
                  </div>
                  <button onClick={refreshMasterData} className="flex items-center gap-2 text-xs text-cyan-300 hover:text-white">
                    <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400">Al resolver, la alerta se copia a ALERTAS_RESUELTAS con fecha de resolución y se elimina de ALERTA_COMBO.</p>
              {masterDataError && <p role="alert" className="text-xs text-rose-300">Error de Oracle: {masterDataError}</p>}

              <div className="grid grid-cols-1 gap-3">
                {visibleAlerts.map((al, index) => {
                  const alertId = readField(al, 'id_alerta');
                  const alertState = String(readField(al, 'estado_alerta')).toUpperCase();
                  const resolved = isResolvedAlert(al);

                  return <div key={alertId === '-' ? index : alertId} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          readField(al, 'prioridad') === 'ALTA' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          PRIORIDAD {readField(al, 'prioridad')}
                        </span>
                        <span className="text-xs font-mono text-cyan-400">#ALERTA-{alertId}</span>
                        <span className="text-xs font-bold text-white">GPS ID: {readField(al, 'id_gps')}</span>
                        <span className="text-xs text-slate-400">{readField(al, 'tipo_alerta')}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{readField(al, 'descripcion')}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{readField(al, 'fecha')} · {alertState}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {!resolved ? (
                        <button
                          onClick={() => resolveAlert(al)}
                          disabled={resolvingAlertId === alertId}
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> {resolvingAlertId === alertId ? 'Guardando...' : 'Resolver'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 font-semibold px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">
                          {alertState}
                        </span>
                      )}
                    </div>
                  </div>;
                })}
                {alerts.length === 0 && <p className="py-12 text-center text-xs text-slate-500">No hay alertas registradas en Oracle.</p>}
                {alerts.length > 0 && visibleAlerts.length === 0 && <p className="py-12 text-center text-xs text-slate-500">No hay alertas {alertView}.</p>}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}