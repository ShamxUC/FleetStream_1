import React, { useState, useEffect } from 'react';
import { 
  Car, ShieldAlert, Cpu, Database, Activity, MapPin, 
  CheckCircle, AlertTriangle, Search, Play, Terminal, Server, Radio, Filter
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('fleet');
  const [streamActive, setStreamActive] = useState(true);
  const [ordsStatus] = useState('CONNECTED');
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGps, setFilterGps] = useState('TODOS');

  // Base de datos expandida a 50 Registros Maestros de Flota
  const [fleetList] = useState([
    { patente: 'ABCD-12', marca: 'Mercedes-Benz', modelo: 'Actros 2651', anio: 2024, conductor: 'Juan Pérez', run: '15.420.111-K', sucursal: 'Sucursal Santiago Norte', empresa: 'Logística TransAndina', estadoGps: 'ACTIVO', ruta: 'RUTA-NORD-01 (Santiago - Valparaíso)', tipo: 'Camión Articulado' },
    { patente: 'KKLM-99', marca: 'Volvo', modelo: 'FH16 750', anio: 2025, conductor: 'María Silva', run: '18.230.988-5', sucursal: 'Sucursal Concepción Sur', empresa: 'TransPacífico SA', estadoGps: 'ACTIVO', ruta: 'RUTA-SUR-04 (Santiago - Concepción)', tipo: 'Camión Pesado' },
    { patente: 'RSTU-45', marca: 'Scania', modelo: 'R500 V8', anio: 2023, conductor: 'Carlos Tapia', run: '12.890.344-3', sucursal: 'Sucursal Valparaíso Puerto', empresa: 'FleetStream Cargo', estadoGps: 'INACTIVO', ruta: 'RUTA-PUERTO-02 (Valparaíso - San Antonio)', tipo: 'Tractor Camión' },
    { patente: 'GHJK-78', marca: 'MAN', modelo: 'TGX 18.510', anio: 2024, conductor: 'Ana Morales', run: '16.781.222-9', sucursal: 'Sucursal Antofagasta', empresa: 'Minera TransChile', estadoGps: 'ACTIVO', ruta: 'RUTA-NORTE-08 (Antofagasta - Calama)', tipo: 'Camión Minero' },
    { patente: 'BCDF-34', marca: 'Freightliner', modelo: 'Cascadia 126', anio: 2023, conductor: 'Roberto Gómez', run: '14.556.789-0', sucursal: 'Sucursal Santiago Norte', empresa: 'Logística TransAndina', estadoGps: 'ACTIVO', ruta: 'RUTA-CENTRO-03 (Santiago - Rancagua)', tipo: 'Camión Reparto' },
    { patente: 'HJLN-56', marca: 'Kenworth', modelo: 'T680 NextGen', anio: 2025, conductor: 'Patricia Reyes', run: '17.334.512-1', sucursal: 'Sucursal Los Andes', empresa: 'FleetStream Cargo', estadoGps: 'ACTIVO', ruta: 'RUTA-CORDILLERA-01 (Santiago - Mendoza)', tipo: 'Tractor Internacional' },
    { patente: 'PRST-78', marca: 'DAF', modelo: 'XF 530 Super Space', anio: 2022, conductor: 'Gonzalo Muñoz', run: '13.112.900-4', sucursal: 'Sucursal Coquimbo', empresa: 'TransPacífico SA', estadoGps: 'INACTIVO', ruta: 'RUTA-NORTE-02 (La Serena - Coquimbo)', tipo: 'Camión Frigorífico' },
    { patente: 'VWXY-12', marca: 'Iveco', modelo: 'S-Way 510', anio: 2024, conductor: 'Claudia Fuentealba', run: '19.001.345-K', sucursal: 'Sucursal Puerto Montt', empresa: 'Austral Freight', estadoGps: 'ACTIVO', ruta: 'RUTA-SUR-12 (Puerto Montt - Chiloé)', tipo: 'Camión Carga General' },
    { patente: 'ZABC-34', marca: 'International', modelo: 'LT Series', anio: 2023, conductor: 'Esteban Araya', run: '11.890.678-2', sucursal: 'Sucursal Talca', empresa: 'Agrícola del Valle', estadoGps: 'ACTIVO', ruta: 'RUTA-CENTRO-09 (Talca - Linares)', tipo: 'Camión Tolva' },
    { patente: 'DEFG-56', marca: 'Mack', modelo: 'Anthem 64T', anio: 2024, conductor: 'Verónica Castro', run: '15.998.123-7', sucursal: 'Sucursal Antofagasta', empresa: 'Minera TransChile', estadoGps: 'ACTIVO', ruta: 'RUTA-MINA-05 (Calama - San Pedro)', tipo: 'Camión Estanque' },
    { patente: 'HIJK-78', marca: 'Volvo', modelo: 'FM 460', anio: 2022, conductor: 'Diego Contreras', run: '16.445.890-1', sucursal: 'Sucursal Concepción Sur', empresa: 'TransPacífico SA', estadoGps: 'INACTIVO', ruta: 'RUTA-SUR-01 (Chillán - Concepción)', tipo: 'Camión Plano' },
    { patente: 'LMNO-90', marca: 'Mercedes-Benz', modelo: 'Atego 1726', anio: 2023, conductor: 'Francisca Lagos', run: '18.776.543-8', sucursal: 'Sucursal Santiago Centro', empresa: 'Express Distribution', estadoGps: 'ACTIVO', ruta: 'RUTA-URBANA-01 (Santiago RM)', tipo: 'Camión 3/4' },
    { patente: 'PQRS-12', marca: 'Scania', modelo: 'G450 XT', anio: 2024, conductor: 'Rodrigo Espinoza', run: '14.221.009-3', sucursal: 'Sucursal Rancagua', empresa: 'Agrícola del Valle', estadoGps: 'ACTIVO', ruta: 'RUTA-AGRO-04 (Rancagua - San Fernando)', tipo: 'Camión Cerealero' },
    { patente: 'TUVW-34', marca: 'Fuso', modelo: 'Canter 815', anio: 2025, conductor: 'Camila Sepúlveda', run: '20.123.456-7', sucursal: 'Sucursal Santiago Centro', empresa: 'Express Distribution', estadoGps: 'ACTIVO', ruta: 'RUTA-URBANA-05 (Providencia - Las Condes)', tipo: 'Furgón Reparto' },
    { patente: 'XYZA-56', marca: 'Hino', modelo: '500 Series 1626', anio: 2023, conductor: 'Hernán Valenzuela', run: '12.445.667-8', sucursal: 'Sucursal Temuco', empresa: 'Austral Freight', estadoGps: 'INACTIVO', ruta: 'RUTA-SUR-08 (Temuco - Valdivia)', tipo: 'Camión Rampla' },
    { patente: 'BCDE-78', marca: 'ISUZU', modelo: 'FVR 34', anio: 2022, conductor: 'Daniela Olivares', run: '17.890.123-4', sucursal: 'Sucursal Valparaíso Puerto', empresa: 'FleetStream Cargo', estadoGps: 'ACTIVO', ruta: 'RUTA-PUERTO-01 (Valparaíso - Viña)', tipo: 'Camión Contenedor' },
    { patente: 'FGHI-90', marca: 'Volkswagen', modelo: 'Constellation 24.280', anio: 2024, conductor: 'Matias Sanhueza', run: '15.678.901-2', sucursal: 'Sucursal Los Andes', empresa: 'Logística TransAndina', estadoGps: 'ACTIVO', ruta: 'RUTA-PASO-02 (Los Andes - Portillo)', tipo: 'Camión Refrigerado' },
    { patente: 'JKLM-12', marca: 'Hyundai', modelo: 'EX8 HD78', anio: 2025, conductor: 'Javier Navarro', run: '19.456.789-0', sucursal: 'Sucursal Coquimbo', empresa: 'TransPacífico SA', estadoGps: 'ACTIVO', ruta: 'RUTA-COSTA-03 (Coquimbo - Ovalle)', tipo: 'Camión Chasis' },
    { patente: 'NOPQ-34', marca: 'Scania', modelo: 'P360 6x2', anio: 2023, conductor: 'Loreto Riquelme', run: '13.890.112-5', sucursal: 'Sucursal Concepción Sur', empresa: 'FleetStream Cargo', estadoGps: 'ACTIVO', ruta: 'RUTA-SUR-15 (Concepción - Coronel)', tipo: 'Camión Carga Pesada' },
    { patente: 'RSTU-56', marca: 'Mercedes-Benz', modelo: 'Axor 3131', anio: 2024, conductor: 'Felipe Soto', run: '16.123.890-K', sucursal: 'Sucursal Antofagasta', empresa: 'Minera TransChile', estadoGps: 'ACTIVO', ruta: 'RUTA-MINA-09 (Antofagasta - Sierra Gorda)', tipo: 'Camión Mixero' },
    { patente: 'VWXY-78', marca: 'Volvo', modelo: 'VM 330 8x2', anio: 2022, conductor: 'Alejandra Pizarro', run: '18.456.123-9', sucursal: 'Sucursal Puerto Montt', empresa: 'Austral Freight', estadoGps: 'INACTIVO', ruta: 'RUTA-SUR-20 (Puerto Montt - Osorno)', tipo: 'Camión Ganadero' },
    { patente: 'ZABC-90', marca: 'MAN', modelo: 'TGM 18.290', anio: 2025, conductor: 'Gabriel Vera', run: '20.890.456-1', sucursal: 'Sucursal Santiago Norte', empresa: 'Logística TransAndina', estadoGps: 'ACTIVO', ruta: 'RUTA-CENTRO-10 (Santiago - Melipilla)', tipo: 'Camión Carga Seca' },
    { patente: 'CDEF-11', marca: 'Kenworth', modelo: 'T880 Heavy Haul', anio: 2024, conductor: 'Ricardo Lagos', run: '11.543.221-8', sucursal: 'Sucursal Iquique', empresa: 'Minera TransChile', estadoGps: 'ACTIVO', ruta: 'RUTA-NORTE-01 (Iquique - Pozo Almonte)', tipo: 'Cama Baja Especial' },
    { patente: 'GHIJ-22', marca: 'Volvo', modelo: 'FMX 500 6x4', anio: 2025, conductor: 'Ignacio Mellado', run: '17.654.321-9', sucursal: 'Sucursal Copiapó', empresa: 'Minera TransChile', estadoGps: 'ACTIVO', ruta: 'RUTA-MINA-12 (Copiapó - Tierra Amarilla)', tipo: 'Camión Tolva Minero' },
    { patente: 'KLMN-33', marca: 'Scania', modelo: 'S650 V8 Highline', anio: 2024, conductor: 'Natalia Cordero', run: '18.987.654-3', sucursal: 'Sucursal Santiago Norte', empresa: 'Logística TransAndina', estadoGps: 'ACTIVO', ruta: 'RUTA-NORD-05 (Santiago - La Serena)', tipo: 'Tractor Gran Volumen' },
    { patente: 'OPQR-44', marca: 'Freightliner', modelo: 'M2 106 Medium', anio: 2023, conductor: 'Sebastián Palma', run: '16.321.455-7', sucursal: 'Sucursal Talca', empresa: 'Agrícola del Valle', estadoGps: 'ACTIVO', ruta: 'RUTA-AGRO-02 (Curicó - Talca)', tipo: 'Camión Capitonado' },
    { patente: 'STUV-55', marca: 'Mercedes-Benz', modelo: 'Arocs 3345', anio: 2022, conductor: 'Marcos Villegas', run: '12.654.789-2', sucursal: 'Sucursal Valparaíso Puerto', empresa: 'FleetStream Cargo', estadoGps: 'INACTIVO', ruta: 'RUTA-PUERTO-05 (San Antonio - Melipilla)', tipo: 'Camión Portacontenedor' },
    { patente: 'WXYZ-66', marca: 'International', modelo: 'HV Series 607', anio: 2024, conductor: 'Javiera Bustamante', run: '19.876.543-1', sucursal: 'Sucursal Rancagua', empresa: 'Agrícola del Valle', estadoGps: 'ACTIVO', ruta: 'RUTA-CENTRO-05 (Rancagua - Machalí)', tipo: 'Camión Estanque Alimentos' },
    { patente: 'ABCD-77', marca: 'DAF', modelo: 'CF 450 FT', anio: 2023, conductor: 'Mauricio Toledo', run: '14.987.123-5', sucursal: 'Sucursal Concepción Sur', empresa: 'TransPacífico SA', estadoGps: 'ACTIVO', ruta: 'RUTA-SUR-02 (Concepción - Los Ángeles)', tipo: 'Camión Forestal' },
    { patente: 'EFGH-88', marca: 'Mack', modelo: 'Granite Gu813', anio: 2025, conductor: 'Camila Alarcón', run: '17.123.456-0', sucursal: 'Sucursal Antofagasta', empresa: 'Minera TransChile', estadoGps: 'ACTIVO', ruta: 'RUTA-MINA-01 (Antofagasta - Mejillones)', tipo: 'Camión Hormigonero' },
    { patente: 'IJKL-99', marca: 'Iveco', modelo: 'Trakker 450', anio: 2022, conductor: 'Oscar Paredes', run: '13.456.789-K', sucursal: 'Sucursal Puerto Montt', empresa: 'Austral Freight', estadoGps: 'INACTIVO', ruta: 'RUTA-SUR-25 (Osorno - Valdivia)', tipo: 'Camión Estanque Químico' },
    { patente: 'MNOP-00', marca: 'Volkswagen', modelo: 'Delivery 11.180', anio: 2024, conductor: 'Paula Venegas', run: '20.321.654-8', sucursal: 'Sucursal Santiago Centro', empresa: 'Express Distribution', estadoGps: 'ACTIVO', ruta: 'RUTA-URBANA-08 (Maipú - Pudahuel)', tipo: 'Furgón Isotérmico' },
    { patente: 'QRST-11', marca: 'Fuso', modelo: 'FJ 1823 Heavy', anio: 2023, conductor: 'Tomás Garrido', run: '15.876.543-2', sucursal: 'Sucursal Coquimbo', empresa: 'TransPacífico SA', estadoGps: 'ACTIVO', ruta: 'RUTA-NORTE-04 (Vallenar - La Serena)', tipo: 'Camión Paquetería' },
    { patente: 'UVWX-22', marca: 'Scania', modelo: 'R450 B8x2', anio: 2025, conductor: 'Daniela Godoy', run: '18.123.987-6', sucursal: 'Sucursal Los Andes', empresa: 'Logística TransAndina', estadoGps: 'ACTIVO', ruta: 'RUTA-CORDILLERA-03 (San Felipe - Los Andes)', tipo: 'Camión Carga Seca' },
    { patente: 'YZAB-33', marca: 'Hino', modelo: '300 Series 816', anio: 2024, conductor: 'Andrés Salamanca', run: '16.987.321-4', sucursal: 'Sucursal Temuco', empresa: 'Austral Freight', estadoGps: 'ACTIVO', ruta: 'RUTA-SUR-09 (Temuco - Lautaro)', tipo: 'Camión Chasis Ligero' },
    { patente: 'CDEF-44', marca: 'Volvo', modelo: 'FH 540 Globetrotter', anio: 2024, conductor: 'Monika Bravo', run: '14.321.654-7', sucursal: 'Sucursal Iquique', empresa: 'Minera TransChile', estadoGps: 'ACTIVO', ruta: 'RUTA-NORTE-09 (Iquique - Arica)', tipo: 'Tractor Bitren' },
    { patente: 'GHIJ-55', marca: 'Mercedes-Benz', modelo: 'Actros 2045', anio: 2023, conductor: 'Claudio Miranda', run: '12.123.456-1', sucursal: 'Sucursal Santiago Norte', empresa: 'Logística TransAndina', estadoGps: 'ACTIVO', ruta: 'RUTA-CENTRO-12 (Santiago - San Antonio)', tipo: 'Camión Portacontenedores' },
    { patente: 'KLMN-66', marca: 'MAN', modelo: 'TGS 33.480', anio: 2025, conductor: 'Valeria Inostroza', run: '19.654.321-3', sucursal: 'Sucursal Copiapó', empresa: 'Minera TransChile', estadoGps: 'ACTIVO', ruta: 'RUTA-MINA-15 (Copiapó - Chañaral)', tipo: 'Camión Sobredimensionado' },
    { patente: 'OPQR-77', marca: 'Freightliner', modelo: 'M2 112 Heavy', anio: 2022, conductor: 'Enrique Pino', run: '10.987.654-2', sucursal: 'Sucursal Concepción Sur', empresa: 'FleetStream Cargo', estadoGps: 'INACTIVO', ruta: 'RUTA-SUR-06 (Concepción - Talcahuano)', tipo: 'Camión Grúa' },
    { patente: 'STUV-88', marca: 'ISUZU', modelo: 'NQR 90', anio: 2024, conductor: 'Soledad Figueroa', run: '17.456.123-K', sucursal: 'Sucursal Rancagua', empresa: 'Agrícola del Valle', estadoGps: 'ACTIVO', ruta: 'RUTA-AGRO-08 (Rancagua - Rengo)', tipo: 'Camión Estaca' },
    { patente: 'WXYZ-99', marca: 'Kenworth', modelo: 'T370 Medium Duty', anio: 2023, conductor: 'Benjamin Riquelme', run: '20.456.789-2', sucursal: 'Sucursal Santiago Centro', empresa: 'Express Distribution', estadoGps: 'ACTIVO', ruta: 'RUTA-URBANA-12 (Santiago - Quilicura)', tipo: 'Camión Furgón' },
    { patente: 'ABCD-00', marca: 'Scania', modelo: 'G500 V8 XT', anio: 2025, conductor: 'Kevin Pérez', run: '19.876.123-5', sucursal: 'Sucursal Antofagasta', empresa: 'Minera TransChile', estadoGps: 'ACTIVO', ruta: 'RUTA-MINA-20 (Antofagasta - Calama Express)', tipo: 'Camión Alto Tonelaje' },
    { patente: 'EFGH-11', marca: 'Volvo', modelo: 'VM 270 6x2', anio: 2023, conductor: 'Lorena San Martín', run: '15.321.987-4', sucursal: 'Sucursal Puerto Montt', empresa: 'Austral Freight', estadoGps: 'ACTIVO', ruta: 'RUTA-SUR-30 (Puerto Montt - Calbuco)', tipo: 'Camión Alguero' },
    { patente: 'IJKL-22', marca: 'DAF', modelo: 'LF 290 FA', anio: 2024, conductor: 'Gonzalo Saavedra', run: '13.654.987-8', sucursal: 'Sucursal Valparaíso Puerto', empresa: 'FleetStream Cargo', estadoGps: 'ACTIVO', ruta: 'RUTA-PUERTO-09 (Valparaíso - Quilpué)', tipo: 'Camión Paquetero' },
    { patente: 'MNOP-33', marca: 'Mercedes-Benz', modelo: 'Atego 2430', anio: 2025, conductor: 'Silvia Leiva', run: '18.432.109-1', sucursal: 'Sucursal Talca', empresa: 'Agrícola del Valle', estadoGps: 'ACTIVO', ruta: 'RUTA-CENTRO-15 (Talca - San Javier)', tipo: 'Camión Carga Frutal' },
    { patente: 'QRST-44', marca: 'Mack', modelo: 'LR Electric', anio: 2025, conductor: 'Matías Orellana', run: '21.009.876-3', sucursal: 'Sucursal Santiago Centro', empresa: 'Express Distribution', estadoGps: 'ACTIVO', ruta: 'RUTA-ECOLOGICA-01 (Santiago Centro)', tipo: 'Camión 100% Eléctrico' },
    { patente: 'UVWX-55', marca: 'International', modelo: 'MV607 Medium', anio: 2023, conductor: 'Carla Villanueva', run: '16.876.543-9', sucursal: 'Sucursal Coquimbo', empresa: 'TransPacífico SA', estadoGps: 'INACTIVO', ruta: 'RUTA-NORTE-06 (La Serena - Vicuña)', tipo: 'Camión Cisterna' },
    { patente: 'YZAB-66', marca: 'Volkswagen', modelo: 'Meteor 28.460', anio: 2024, conductor: 'Renato Sandoval', run: '14.109.876-2', sucursal: 'Sucursal Los Andes', empresa: 'Logística TransAndina', estadoGps: 'ACTIVO', ruta: 'RUTA-CORDILLERA-05 (Los Andes - Chacabuco)', tipo: 'Tractor Gran Tonelaje' },
    { patente: 'CDEF-77', marca: 'Hino', modelo: '700 Heavy Duty', anio: 2024, conductor: 'Francisca Maldonado', run: '17.987.654-1', sucursal: 'Sucursal Concepción Sur', empresa: 'TransPacífico SA', estadoGps: 'ACTIVO', ruta: 'RUTA-SUR-18 (Concepción - Penco)', tipo: 'Camión Volquete' },
    { patente: 'GHIJ-88', marca: 'Scania', modelo: 'R580 V8 Streamline', anio: 2025, conductor: 'Cristian Medina', run: '11.234.567-9', sucursal: 'Sucursal Santiago Norte', empresa: 'FleetStream Cargo', estadoGps: 'ACTIVO', ruta: 'RUTA-NORD-10 (Santiago - Coquimbo Express)', tipo: 'Tractor de Línea' }
  ]);

  // Realtime Telematic Pings
  const [telemetryEvents, setTelemetryEvents] = useState([
    { id: 'TELE-901', patente: 'ABCD-12', conductor: 'Juan Pérez', velocidad: 88, combustible: 74, rpm: 2100, timestamp: '14:32:01', estado: 'Normal' },
    { id: 'TELE-902', patente: 'KKLM-99', conductor: 'María Silva', velocidad: 112, combustible: 45, rpm: 3400, timestamp: '14:32:04', estado: 'Exceso Velocidad' },
    { id: 'TELE-903', patente: 'RSTU-45', conductor: 'Carlos Tapia', velocidad: 0, combustible: 90, rpm: 0, timestamp: '14:31:58', estado: 'Detenido' },
    { id: 'TELE-904', patente: 'GHJK-78', conductor: 'Ana Morales', velocidad: 65, combustible: 62, rpm: 1800, timestamp: '14:32:05', estado: 'Normal' },
  ]);

  // Alertas activas
  const [alerts, setAlerts] = useState([
    { id_alerta: 101, patente: 'KKLM-99', conductor: 'María Silva', tipo: 'EXCESO_VELOCIDAD', prioridad: 'ALTA', estado: 'PENDIENTE', fecha: '2026-10-22 14:32:04', desc: 'Velocidad registrada (112 km/h) supera el umbral máximo de 100 km/h en Ruta 68.' },
    { id_alerta: 102, patente: 'RSTU-45', conductor: 'Carlos Tapia', tipo: 'DTC_MOTOR', prioridad: 'MEDIA', estado: 'PENDIENTE', fecha: '2026-10-22 14:28:10', desc: 'Código de falla detectado P0300 (Fallo de encendido en cilindros múltiples).' },
    { id_alerta: 103, patente: 'ABCD-12', conductor: 'Juan Pérez', tipo: 'DESVIO_RUTA', prioridad: 'BAJA', estado: 'RESUELTA', fecha: '2026-10-22 13:45:00', desc: 'Vehículo salió del trazado de ruta planificado RUTA-NORD-01 por 500 metros.' }
  ]);

  // Simulación de Ingesta Telemática
  useEffect(() => {
    if (!streamActive) return;
    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      const randomVehicle = fleetList[Math.floor(Math.random() * fleetList.length)];
      const speedVariation = Math.floor(Math.random() * 35) + 55;
      const fuelVariation = Math.floor(Math.random() * 95) + 5;
      
      const newPing = {
        id: `TELE-${Math.floor(Math.random() * 900) + 100}`,
        patente: randomVehicle.patente,
        conductor: randomVehicle.conductor,
        velocidad: speedVariation,
        combustible: fuelVariation,
        rpm: speedVariation * 28,
        timestamp: now,
        estado: speedVariation > 100 ? 'Exceso Velocidad' : 'Normal'
      };

      setTelemetryEvents(prev => [newPing, ...prev.slice(0, 5)]);

      if (speedVariation > 100) {
        const newAlert = {
          id_alerta: Math.floor(Math.random() * 800) + 200,
          patente: randomVehicle.patente,
          conductor: randomVehicle.conductor,
          tipo: 'EXCESO_VELOCIDAD',
          prioridad: 'ALTA',
          estado: 'PENDIENTE',
          fecha: `2026-10-22 ${now}`,
          desc: `Alerta automática IoT: Velocidad instantánea de ${speedVariation} km/h detectada por GPS en vehículo ${randomVehicle.patente}.`
        };
        setAlerts(prev => [newAlert, ...prev]);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [streamActive, fleetList]);

  // Filtro de búsqueda de flota
  const filteredFleet = fleetList.filter(item => {
    const matchesSearch = item.patente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.conductor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sucursal.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.empresa.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGps = filterGps === 'TODOS' || item.estadoGps === filterGps;
    return matchesSearch && matchesGps;
  });

  // Ejecutor de scripts PL/SQL en consola
  const runPLSQLProcedure = (procName) => {
    const timestamp = new Date().toLocaleTimeString();
    let logs = [];

    if (procName === 'generate_employee_report') {
      logs = [
        `[${timestamp}] Executing DBMS_OUTPUT for PROCEDURE generate_employee_report...`,
        `--------------- TICKET ALERTA ---------------`,
        `Id Alerta: 101`,
        `Fecha: 2026-10-22 14:32:04`,
        `Prioridad: ALTA`,
        `Estado: PENDIENTE`,
        `Patente Vehiculo: KKLM-99`,
        `Modelo Vehiculo: Volvo FH16 750`,
        `Asignado de Turno: María Francisca Silva Morales`,
        `Descripcion: Velocidad registrada (112 km/h) supera el umbral máximo de 100 km/h en Ruta 68.`,
        `---------------------------------------------`,
        `[${timestamp}] PL/SQL procedure successfully completed.`
      ];
    } else if (procName === 'pkg_fleetstream.actualizar_estado_gps') {
      logs = [
        `[${timestamp}] Executing PKG_FLEETSTREAM.ACTUALIZAR_ESTADO_GPS('GPS-001', 'ACTIVO')...`,
        `[${timestamp}] UPDATE DISPOSITIVO_GPS SET estado = 'ACTIVO' WHERE id_gps = 'GPS-001'`,
        `[${timestamp}] Trigger TRG_AUDITORIA_GPS fired: Recorded status change into AUDITORIA_GPS table.`,
        `[${timestamp}] PL/SQL procedure completed successfully.`
      ];
    } else if (procName === 'RECORD_VARRAY_DEMO') {
      logs = [
        `[${timestamp}] Executing RECORD & VARRAY Demonstration Block...`,
        `Vehiculo: ABCD-12 | Mercedes-Benz Actros | GPS: ACTIVO`,
        `Tipo de alerta 1: EXCESO_VELOCIDAD`,
        `Tipo de alerta 2: FRENADO_BRUSCO`,
        `Tipo de alerta 3: DESVIO_RUTA`,
        `Tipo de alerta 4: TEMP_ALTA`,
        `Tipo de alerta 5: DTC_MOTOR`,
        `[${timestamp}] Block finished without exceptions.`
      ];
    }

    setTerminalOutput(logs);
  };

  const resolveAlert = (id) => {
    setAlerts(alerts.map(a => a.id_alerta === id ? { ...a, estado: 'RESUELTA' } : a));
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
            <Server className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Oracle Cloud ORDS:</span>
            <span className="font-semibold text-emerald-400">{ordsStatus}</span>
          </div>

          <button 
            onClick={() => setStreamActive(!streamActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              streamActive 
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {streamActive ? 'Pausar Telemetría' : 'Reanudar Ingesta'}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col gap-2">
          <div className="text-xs font-bold text-slate-500 uppercase px-3 mb-1 tracking-wider">Módulos del Sistema</div>
          
          <button 
            onClick={() => setActiveTab('dashboard')}
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
                Wallet SSL habilitado. Pings telemáticos sincronizados mediante ORDS REST endpoints.
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
                      <CheckCircle className="w-3 h-3" /> {fleetList.filter(f => f.estadoGps === 'ACTIVO').length} con GPS Activo
                    </p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                    <Car className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Ingesta IoT (NoSQL)</p>
                    <h3 className="text-2xl font-bold text-white mt-1">1,420 pings/m</h3>
                    <p className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
                      <Radio className="w-3 h-3 animate-pulse" /> Transmisión viva
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
                      {alerts.filter(a => a.estado === 'PENDIENTE').length} Pendientes
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
                    <h3 className="text-2xl font-bold text-white mt-1">3FN Relacional</h3>
                    <p className="text-[11px] text-indigo-400 mt-1 flex items-center gap-1">
                      <Database className="w-3 h-3" /> PL/SQL Packages OK
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
                      <Activity className="w-5 h-5 text-cyan-400" /> Ingesta Telemática en Tiempo Real (OBD-II / GPS)
                    </h2>
                    <p className="text-xs text-slate-400">Eventos recibidos mediante tramas JSON de sensores IoT</p>
                  </div>
                  <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
                    Frecuencia: 4 sec
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-3">ID Evento</th>
                        <th className="p-3">Patente</th>
                        <th className="p-3">Conductor</th>
                        <th className="p-3">Velocidad</th>
                        <th className="p-3">Combustible</th>
                        <th className="p-3">RPM</th>
                        <th className="p-3">Hora Ping</th>
                        <th className="p-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {telemetryEvents.map((e, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-3 font-mono text-cyan-400">{e.id}</td>
                          <td className="p-3 font-semibold text-white">{e.patente}</td>
                          <td className="p-3">{e.conductor}</td>
                          <td className="p-3">
                            <span className={`font-mono font-bold ${e.velocidad > 100 ? 'text-rose-400' : 'text-slate-200'}`}>
                              {e.velocidad} km/h
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${e.combustible < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                  style={{ width: `${e.combustible}%` }}
                                />
                              </div>
                              <span className="font-mono text-[11px]">{e.combustible}%</span>
                            </div>
                          </td>
                          <td className="p-3 font-mono">{e.rpm} RPM</td>
                          <td className="p-3 text-slate-400 font-mono">{e.timestamp}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              e.estado === 'Exceso Velocidad' 
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {e.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
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

                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
                      <Filter className="w-3.5 h-3.5 text-cyan-400" />
                      <select 
                        value={filterGps}
                        onChange={(e) => setFilterGps(e.target.value)}
                        className="bg-transparent focus:outline-none text-xs text-slate-200 cursor-pointer"
                      >
                        <option value="TODOS" className="bg-slate-900">Todos los GPS</option>
                        <option value="ACTIVO" className="bg-slate-900">GPS Activo</option>
                        <option value="INACTIVO" className="bg-slate-900">GPS Inactivo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFleet.map((v, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition-all hover:shadow-lg hover:shadow-cyan-950/20">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm tracking-wide font-mono bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                            {v.patente}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{v.tipo}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          v.estadoGps === 'ACTIVO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          GPS {v.estadoGps}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="text-slate-200 font-semibold">{v.marca} {v.modelo} ({v.anio})</p>
                        <p className="text-slate-400">Conductor: <span className="text-slate-200 font-medium">{v.conductor}</span></p>
                        <p className="text-slate-500 text-[11px] font-mono">RUN: {v.run}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 space-y-1 text-[11px]">
                        <p className="text-cyan-400/90 font-medium">{v.empresa} • <span className="text-slate-400">{v.sucursal}</span></p>
                        <p className="text-slate-400 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" /> {v.ruta}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredFleet.length === 0 && (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No se encontraron vehículos que coincidan con los criterios de búsqueda.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'plsql' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
                  <Terminal className="w-5 h-5 text-cyan-400" /> Consola de Ejecución PL/SQL Oracle Cloud
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  Prueba la ejecución procedural del script <code className="text-cyan-400">FleetStream Procedure.sql</code> y objetos del informe.
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
                    <p className="text-slate-600 italic">Haz clic en uno de los botones para ejecutar el procedimiento PL/SQL en la base de datos...</p>
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
                <span className="text-xs text-slate-400">Reglas de negocio y umbrales telemáticos</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {alerts.map((al) => (
                  <div key={al.id_alerta} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          al.prioridad === 'ALTA' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          PRIORIDAD {al.prioridad}
                        </span>
                        <span className="text-xs font-mono text-cyan-400">#TICKET-{al.id_alerta}</span>
                        <span className="text-xs font-bold text-white">• Patente: {al.patente}</span>
                        <span className="text-xs text-slate-400">({al.conductor})</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{al.desc}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{al.fecha}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {al.estado === 'PENDIENTE' ? (
                        <button 
                          onClick={() => resolveAlert(al.id_alerta)}
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Resolver
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 font-semibold px-3 py-1 bg-slate-950 rounded-lg border border-slate-800">
                          Resuelta
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}