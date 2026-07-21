import { AutistaActivity, SanitariChecklistItem, CrewStatus, DeadlineNotification } from './types';

export const INITIAL_AUTISTI_ACTIVITIES: AutistaActivity[] = [
  { id: 'a1', name: 'LETTURA CONTACHILOMETRI', type: 'number_input', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a2', name: 'LAMPEGGIANTI / SIRENA BITONALE', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a3', name: 'FARI ANTERIORI ANABBAGLIANTI', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a4', name: 'FARI ANTERIORI ABBAGLIANTI', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a5', name: 'LUCI POSIZIONE ANTER. - POST. - TARGA', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a6', name: 'INDICATORI DI DIREZIONE - LUCI STOP', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a7', name: 'SEDILI VANO GUIDA - VANO SANITARIO', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a8', name: 'LUCI RETROMARCIA E SEGNALE ACUSTICO', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a9', name: 'FENDINEBBIA - RETRONEBBIA', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a10', name: 'LUCI VANO GUIDA', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a11', name: 'LUCI VANO SANITARIO', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a12', name: 'FARO FALCO - LUCI LATERALI', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a13', name: 'CONTROLLO OLIO LUBRIFICANTE', type: 'select_min_norm_max', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: 'NORM' }, turn2: { status: 'NON_RILEVATO', val: 'NORM' }, turn3: { status: 'NON_RILEVATO', val: 'NORM' } },
  { id: 'a14', name: 'CONTROLLO LIQUIDO RADIATORE', type: 'select_min_norm_max', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: 'NORM' }, turn2: { status: 'NON_RILEVATO', val: 'NORM' }, turn3: { status: 'NON_RILEVATO', val: 'NORM' } },
  { id: 'a15', name: 'CONTROLLO LIQUIDO TERGICRISTALLI', type: 'select_min_norm_max', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: 'NORM' }, turn2: { status: 'NON_RILEVATO', val: 'NORM' }, turn3: { status: 'NON_RILEVATO', val: 'NORM' } },
  { id: 'a16', name: 'STATO PNEUMATICI', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a17', name: 'SISTEMA DI CONDIZIONAMENTO', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a18', name: 'SISTEMA DI RISCALDAMENTO', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a19', name: 'LIVELLO CARBURANTE', type: 'select_min_norm_max', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: 'NORM' }, turn2: { status: 'NON_RILEVATO', val: 'NORM' }, turn3: { status: 'NON_RILEVATO', val: 'NORM' } },
  { id: 'a20', name: 'SCHEDA CARBURANTE + DOCUMENTAZIONE VEICOLO', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a21', name: 'ESTINTORI', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a22', name: 'KIT SCASSO + TORCIA CON CONO EMERGENZA + KIT SOSTIT. RUOTA', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a23', name: 'CONTROLLO SPIE CRUSCOTTO', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a24', name: 'CONTROLLO NAVIGATORE TOMTOM', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a25', name: 'PEDANA - PORTA SCORREVOLE', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a26', name: 'PULIZIA VANO SANITARIO', type: 'select_si_no', category: 'vano_sanitario', turn1: { status: 'NON_RILEVATO', val: 'SI' }, turn2: { status: 'NON_RILEVATO', val: 'SI' }, turn3: { status: 'NON_RILEVATO', val: 'SI' } },
  { id: 'a27', name: 'STATO BARELLA + TELO PORTAFERITI', type: 'standard', category: 'vano_sanitario', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a28', name: 'SEDIA CARDIOLOGICA - POCHETTE - CAVO DISPLAY + BATTERIA + CARICA BATTER.', type: 'standard', category: 'vano_sanitario', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a29', name: 'MONITOR MULTI PARAMEDICO CAVI - ACCESSORI - APP. WIFI + DEFIBRILL. MINDRAY', type: 'standard', category: 'vano_sanitario', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a30', name: 'SATURIMETRO PORTATILE + EMOGASSOMETRO', type: 'standard', category: 'vano_sanitario', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a31', name: 'KIT COLLARI + KIT STECCO BENDE', type: 'standard', category: 'presidi_diagnostici', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a32', name: 'KIT SPINALE + FERMA TESTA + RAGNO + CUCCHIAIO + CINGHIE', type: 'standard', category: 'presidi_diagnostici', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a33', name: 'ESTRICATORE FERNO + KED + MATERASSINO A DEPRESS. + POMPA', type: 'standard', category: 'presidi_diagnostici', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a34', name: 'LUCAS + VENTILATORE POLMONARE', type: 'standard', category: 'presidi_diagnostici', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a35', name: 'FORBICE ROBIN + GUANTI L - M - S', type: 'standard', category: 'vano_sanitario', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a36', name: 'ASPIRATORE PORTATILE', type: 'standard', category: 'vano_sanitario', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a37', name: 'CONTROLLO EFFICACIA FRIGO', type: 'standard', category: 'vano_sanitario', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a38', name: 'DPI CASCHI + MASCHERE BLS5150 + FILTRI DIRIN 500', type: 'standard', category: 'controlli', turn1: { status: 'NON_RILEVATO', val: '' }, turn2: { status: 'NON_RILEVATO', val: '' }, turn3: { status: 'NON_RILEVATO', val: '' } },
  { id: 'a39', name: 'IMPIANTO OSSIGENO FISSO', type: 'select_min_norm_max', category: 'vano_sanitario', turn1: { status: 'NON_RILEVATO', val: 'NORM' }, turn2: { status: 'NON_RILEVATO', val: 'NORM' }, turn3: { status: 'NON_RILEVATO', val: 'NORM' } }
];

export const INITIAL_SANITARI_ITEMS: SanitariChecklistItem[] = [
  // CONTROLLI MSB - Sez. A
  { id: 's1', name: 'Gasolio', qty: '%', category: 'CONTROLLI MSB - Sez. A', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's2', name: 'Pneumatici, olio motore, freni', qty: '1', category: 'CONTROLLI MSB - Sez. A', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's3', name: 'Liquido refrigerante, liquido cristalli', qty: '1', category: 'CONTROLLI MSB - Sez. A', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's4', name: 'Fari, lampade', qty: '1', category: 'CONTROLLI MSB - Sez. A', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's5', name: 'Segnali acustici e luminosi d\'emergenza', qty: '1', category: 'CONTROLLI MSB - Sez. A', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's6', name: 'Pulizia esterna carrozzeria', qty: '1', category: 'CONTROLLI MSB - Sez. A', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // COMPARTO GUIDA
  { id: 's7', name: 'Kit scasso e attrezzi cambio ruota', qty: '1', category: 'COMPARTO GUIDA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's8', name: 'Lampade spia quadro generale - Inverter 220V', qty: '1', category: 'COMPARTO GUIDA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's9', name: 'Impianto riscaldamento e climatizzatore', qty: '1', category: 'COMPARTO GUIDA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's10', name: 'Torcia luminosa di segnalazione', qty: '1', category: 'COMPARTO GUIDA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's11', name: 'Lampada di emergenza 12 V', qty: '1', category: 'COMPARTO GUIDA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's12', name: 'Fune traino', qty: '1', category: 'COMPARTO GUIDA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's13', name: 'Tubo per O2 20 mt', qty: '1', category: 'COMPARTO GUIDA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's14', name: 'Torce antivento - Fumogeni di segnalazione', qty: '2', category: 'COMPARTO GUIDA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's15', name: 'Cellulare', qty: '1', category: 'COMPARTO GUIDA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's16', name: 'Cartine stradali + Navigatore', qty: '1', category: 'COMPARTO GUIDA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's17', name: 'Modulistica 118', qty: '1', category: 'COMPARTO GUIDA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // COMPARTO SANITARIO
  { id: 's18', name: 'Pulizia ordinaria giornaliera', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's19', name: 'Pulizia e disinfezione ordinaria (15-30 del mese)', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's20', name: 'Pulizia e disinfezione straordinaria', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's21', name: 'Sistema di aereazione/ventilazione', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's22', name: 'Luci vano sanitario + Faretto direzionale', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's23', name: 'Prese 12V-220V', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's24', name: 'Aspiratore portatile 12/220 V', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's25', name: 'Sondini per aspirazione adulti e pediatrici n° 3 x mis', qty: '30', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's26', name: 'Erogatore O2 attacco fisso', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's27', name: 'KIT CPAP completo di raccordi', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's28', name: 'DAE (con almeno 2 rasoi per tricotomia)', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's29', name: 'Placche DAE adulti/pediatriche', qty: '2+2', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's30', name: 'Rasoi x tricotomia', qty: '3', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's31', name: 'Monitor/Defibrillatore manuale 12/220V', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's32', name: 'Estintore 3Kg', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's33', name: 'Forbice di Robin', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's34', name: 'Sedia portantina per pazienti cardiopatici', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's35', name: 'Barellino cucchiaio con cinghie', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's36', name: 'Barella a caricamento con cinghie', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's37', name: 'Telo da trasporto a 6 maniglie', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's38', name: 'Tavola spinale completa (fermacapo e ragno)', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's39', name: 'Tavola spinale pediatrica (fermacapo e ragno)', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's40', name: 'KED', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's41', name: 'Materassino a depressione con pompa', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's42', name: 'Steccobende rigide e depressione', qty: '1xms', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's43', name: 'Collari cervicali (S - M - L)', qty: '2xms', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's44', name: 'Cuscino - coperta lana', qty: '1', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's45', name: 'Traverse e lenzuola monouso', qty: 'q.b.', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's46', name: 'Guanti monouso S - M - L', qty: '2xms', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's47', name: 'Guanti sterili S - M - L', qty: '2xms', category: 'COMPARTO SANITARIO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // DISPONIBILITA' OSSIGENO
  { id: 's48', name: 'Impianto fisso 2 B tot. 14 lt 200 At (Tot. 2800 lt)', qty: '%', category: 'DISPONIBILITA\' OSSIGENO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's49', name: 'Bombola portatile di emergenza 3 lt 200 At (Tot. 600 lt)', qty: '%', category: 'DISPONIBILITA\' OSSIGENO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's50', name: 'Stroller 1.250 lt Ossigeno liquido (Tot. 1000 lt)', qty: '%', category: 'DISPONIBILITA\' OSSIGENO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // KIT CATETRISMO VESCICALE - SNG
  { id: 's51', name: 'Catetere vescicale 14 - 16 - 18 - 20', qty: '2xms', category: 'KIT CATETRISMO VESCICALE - SNG', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's52', name: 'Sondino Naso Gastrico 14 - 16 - 18 - 20', qty: '2xms', category: 'KIT CATETRISMO VESCICALE - SNG', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's53', name: 'Buste diuresi', qty: '2', category: 'KIT CATETRISMO VESCICALE - SNG', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's54', name: 'Nefluan / Luan', qty: '2', category: 'KIT CATETRISMO VESCICALE - SNG', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's55', name: 'Siringhe 10 ml', qty: '2', category: 'KIT CATETRISMO VESCICALE - SNG', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's56', name: 'Schizzettone 60 ml attacco cono', qty: '2', category: 'KIT CATETRISMO VESCICALE - SNG', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // CASSETTIERA
  { id: 's57', name: 'Deflussori', qty: 'mln.3', category: 'CASSETTIERA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's58', name: 'Deflussori con microgocciolatore e regolatore', qty: '3', category: 'CASSETTIERA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's59', name: 'Deflussori in PVC per infusione Nitroglicerina', qty: '3', category: 'CASSETTIERA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's60', name: 'Aghi cannula 14 - 16 - 18 - 20 - 22', qty: '3xms', category: 'CASSETTIERA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's61', name: 'Siringhe 5 - 10 - 20 ml / insulina', qty: '3xms', category: 'CASSETTIERA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's62', name: 'Chiave connector x ago cannula', qty: '5', category: 'CASSETTIERA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's63', name: 'Cerotto seta / Hypafix', qty: '2', category: 'CASSETTIERA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's64', name: 'Forbice dritta a punte smusse (tipo bottonuto)', qty: '1', category: 'CASSETTIERA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's65', name: 'Bende arrotolate / rete diverse misure', qty: 'q.b.', category: 'CASSETTIERA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's66', name: 'Maschera / BLB - pediatrica e adulti - Occhialini nasali', qty: 'q.b.', category: 'CASSETTIERA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's67', name: 'Maschera x aerosol', qty: 'q.b.', category: 'CASSETTIERA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's68', name: 'Ghiaccio sintetico', qty: 'q.b.', category: 'CASSETTIERA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's69', name: 'Abbassalingua', qty: 'q.b.', category: 'CASSETTIERA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's70', name: 'Bisturi monouso (lanceolato/panciuto)', qty: 'q.b.', category: 'CASSETTIERA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // DISINFETTANTI
  { id: 's71', name: 'Gel lavamani', qty: '1', category: 'DISINFETTANTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's72', name: 'Amuchina MED', qty: '1', category: 'DISINFETTANTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's73', name: 'Braumol', qty: '1', category: 'DISINFETTANTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's74', name: 'Perossido di Idrogeno', qty: '1', category: 'DISINFETTANTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // COMPARTO LIQUIDI
  { id: 's75', name: 'Sol. Fis. 0.9% 100 ml - 250 ml - 500 ml', qty: '5xms', category: 'COMPARTO LIQUIDI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's76', name: 'Sol. Glucosata 5% 250 ml - 500 ml', qty: '3xms', category: 'COMPARTO LIQUIDI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's77', name: 'Elettrolitica Reidratante 500 ml', qty: '3', category: 'COMPARTO LIQUIDI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's78', name: 'Colloidi (plasma expander)', qty: '3', category: 'COMPARTO LIQUIDI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's79', name: 'Mannitolo 18% 100 ml', qty: '3', category: 'COMPARTO LIQUIDI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's80', name: 'Paracetamolo 100 ml', qty: '3', category: 'COMPARTO LIQUIDI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // ZAINO PEDIATRICO
  { id: 's81', name: 'Pallone Autoespandibile (AMBU) con serbatoio', qty: '1+1', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's82', name: 'Maschera per ambu (bianca, rosa, giallo)', qty: '2xms', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's83', name: 'Cannula Guedel (rosa, viola, nera, bianco)', qty: '2xms', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's84', name: 'Sfigmomanometro (neonatale e pediatrico)', qty: '1', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's85', name: 'Fonendo', qty: '1', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's86', name: 'Tubi Endotracheali mis. 3-4-4,5-5-6', qty: '2xms', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's87', name: 'Mandrino', qty: '1', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's88', name: 'Set Intubazione (Lame Miller mis. 0, 1)', qty: '1', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's89', name: 'Pacco batterie ricambio set intubazione', qty: '1', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's90', name: 'Pinza Magill pediatrica', qty: '1', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's91', name: 'Catether-mouth', qty: '1', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's92', name: 'Kit va e vieni neonatale e pediatrico', qty: '1+1', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's93', name: 'Sondini per aspirazione (celeste, nero, bianco)', qty: '2xms', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's94', name: 'Sondini SNG - mis. 10-12-14 F', qty: '2xms', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's95', name: 'Buste diuresi', qty: '1', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's96', name: 'Luan gel', qty: '1', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's97', name: 'Maschera Laringea mis. 1, 2, 3', qty: '1xms', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's98', name: 'Siringa 10 ml', qty: '2', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's99', name: 'Schizzettone attacco cono', qty: '2', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's100', name: 'Garze 10 x 10', qty: 'q.b.', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's101', name: 'Benda orlata / strisce fissatubo', qty: 'q.b.', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's102', name: 'Kit parto', qty: '1', category: 'ZAINO PEDIATRICO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // ZAINO ROSSO ADULTI
  { id: 's103', name: 'Pallone Autoespandibile (AMBU) con serbatoio', qty: '1', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's104', name: 'Maschera per ambu (rosso, verde, blu)', qty: '2xms', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's105', name: 'Cannula Guedel (verde, giallo, rosso, arancio)', qty: '2xms', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's106', name: 'Tubi Endotracheali mis. 6,5 - 7 - 7,5 - 8 - 8,5', qty: '2xms', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's107', name: 'Mandrino', qty: '1', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's108', name: 'Set Intubazione (Lame Macintosh mis. 2, 3, 4)', qty: '1', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's109', name: 'Pinza Magill', qty: '1', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's110', name: 'Pacco batterie ricambio set intubazione', qty: '1', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's111', name: 'Catether-mouth', qty: '1', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's112', name: 'Kit va e vieni adulti', qty: '1', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's113', name: 'Sondini per aspirazione (verde, arancio, rosso)', qty: '3xms', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's114', name: 'Sondini SNG - mis. 14-16-18 F', qty: '2xms', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's115', name: 'Buste diuresi', qty: '1', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's116', name: 'Luan gel', qty: '1', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's117', name: 'Maschera Laringea mis. 3, 4, 5', qty: '1xms', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's118', name: 'Siringa 10 ml', qty: '2', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's119', name: 'Schizzettone attacco cono', qty: '2', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's120', name: 'Garze 10 x 10', qty: 'q.b.', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's121', name: 'Benda orlata / strisce fissatubo', qty: 'q.b.', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's122', name: 'Kit tracheostomia', qty: '1', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's123', name: 'Kit pneumotorace', qty: '1', category: 'ZAINO ROSSO ADULTI', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // BORSA TERMICA
  { id: 's124', name: 'Kit refrigerante', qty: 'q.b.', category: 'BORSA TERMICA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's125', name: 'Acetilsalicilato di lisina 500 mg fl', qty: '5', category: 'BORSA TERMICA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's126', name: 'Adrenalina fl', qty: '5', category: 'BORSA TERMICA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's127', name: 'Diazepam 5 mg microclisma', qty: '2', category: 'BORSA TERMICA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's128', name: 'Diazepam 10 mg microclisma', qty: '2', category: 'BORSA TERMICA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's129', name: 'Glucagone fl', qty: '1', category: 'BORSA TERMICA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's130', name: 'Insulina rapida fl', qty: '1', category: 'BORSA TERMICA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's131', name: 'Isoprenalina', qty: '5', category: 'BORSA TERMICA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's132', name: 'Intralipid 20% 250 ml', qty: '1', category: 'BORSA TERMICA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's133', name: 'Vit K 10 mg fl', qty: '5', category: 'BORSA TERMICA', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // ZAINO GIALLO
  { id: 's134', name: 'Sfigmomanometro + Fonendoscopio', qty: '1', category: 'ZAINO GIALLO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's135', name: 'Glucostick completo (stick+pungidito)', qty: 'q.b.', category: 'ZAINO GIALLO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's136', name: 'Saturimetro', qty: '1', category: 'ZAINO GIALLO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's137', name: 'Cardiovox + Placche adesive', qty: '1', category: 'ZAINO GIALLO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's138', name: 'Termometro', qty: '1', category: 'ZAINO GIALLO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's139', name: 'Laccio emostatico', qty: '2', category: 'ZAINO GIALLO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's140', name: 'Aghi cannula mis 16-18-20-22G', qty: '2xms', category: 'ZAINO GIALLO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's141', name: 'Contenitore x taglienti portatile', qty: '1', category: 'ZAINO GIALLO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's142', name: 'Maschera / BLB - pediatrica e adulti', qty: '2xms', category: 'ZAINO GIALLO', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // FARMACI BORSELLO BLU - Cortisonici/Sol. varie
  { id: 's143', name: 'Soluzione Fis. 0.9% 10 ml', qty: '10', category: 'FARMACI BORSELLO BLU - Cortisonici', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's144', name: 'Betametasone 4 mg', qty: '5', category: 'FARMACI BORSELLO BLU - Cortisonici', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's145', name: 'Idrocortisone 100 mg', qty: '5', category: 'FARMACI BORSELLO BLU - Cortisonici', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's146', name: 'Idrocortisone 500 mg / 1000 mg', qty: '5', category: 'FARMACI BORSELLO BLU - Cortisonici', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's147', name: 'Metilprednisolone 40mg / 125 mg', qty: '3', category: 'FARMACI BORSELLO BLU - Cortisonici', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // FARMACI BORSELLO BLU - Antagonisti
  { id: 's148', name: 'Acido tranexamico', qty: '5', category: 'FARMACI BORSELLO BLU - Antagonisti', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's149', name: 'Acetilcisteina 300 mg', qty: '5', category: 'FARMACI BORSELLO BLU - Antagonisti', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's150', name: 'Bicarbonato di Na 10 ml', qty: '5', category: 'FARMACI BORSELLO BLU - Antagonisti', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's151', name: 'Flumazenil 0,5 mg', qty: '5', category: 'FARMACI BORSELLO BLU - Antagonisti', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's152', name: 'Ca Gluconato 10 ml', qty: '3', category: 'FARMACI BORSELLO BLU - Antagonisti', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's153', name: 'Glucosio 33% 10 ml', qty: '5', category: 'FARMACI BORSELLO BLU - Antagonisti', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's154', name: 'Naloxone', qty: '5', category: 'FARMACI BORSELLO BLU - Antagonisti', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's155', name: 'Solfato di Magnesio 10 ml', qty: '5', category: 'FARMACI BORSELLO BLU - Antagonisti', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // FARMACI BORSELLO VERDE - Antidolorifici / Antispastici
  { id: 's156', name: 'Fluorogucina fl', qty: '5', category: 'FARMACI BORSELLO VERDE - Antidolorifici', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's157', name: 'Metoclopramide fl', qty: '5', category: 'FARMACI BORSELLO VERDE - Antidolorifici', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's158', name: 'Metamizolo fl', qty: '3', category: 'FARMACI BORSELLO VERDE - Antidolorifici', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's159', name: 'Tramadolo 100 mg', qty: '5', category: 'FARMACI BORSELLO VERDE - Antidolorifici', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's160', name: 'Ketorolac 30 mg fl', qty: '3', category: 'FARMACI BORSELLO VERDE - Antidolorifici', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's161', name: 'Ketoprofene 150 mg', qty: '5', category: 'FARMACI BORSELLO VERDE - Antidolorifici', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's162', name: 'Ranitidina 50 mg/ml', qty: '3', category: 'FARMACI BORSELLO VERDE - Antidolorifici', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's163', name: 'Pantoprazolo 40 mg', qty: '2', category: 'FARMACI BORSELLO VERDE - Antidolorifici', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // FARMACI BORSELLO GIALLO - Sedativi
  { id: 's164', name: 'Aloperidolo 2 mg', qty: '3', category: 'FARMACI BORSELLO GIALLO - Sedativi', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's165', name: 'Clorfenamina 10 mg fl', qty: '3', category: 'FARMACI BORSELLO GIALLO - Sedativi', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's166', name: 'Clorpromazina 50 mg fl', qty: '3', category: 'FARMACI BORSELLO GIALLO - Sedativi', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's167', name: 'Diazepam 10 mg fl', qty: '3', category: 'FARMACI BORSELLO GIALLO - Sedativi', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's168', name: 'Prometazina 25 mg fl', qty: '3', category: 'FARMACI BORSELLO GIALLO - Sedativi', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // FARMACI BORSELLO ROSSO - Cardiaci / Respiratori
  { id: 's169', name: 'Adenosina 30 mg fl', qty: '5', category: 'FARMACI BORSELLO ROSSO - Cardiaci', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's170', name: 'Aminofillina fl 10 ml', qty: '5', category: 'FARMACI BORSELLO ROSSO - Cardiaci', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's171', name: 'Amiodarone 150 mg fl', qty: '5', category: 'FARMACI BORSELLO ROSSO - Cardiaci', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's172', name: 'Atenololo 5 mg fl', qty: '5', category: 'FARMACI BORSELLO ROSSO - Cardiaci', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's173', name: 'Atropina 1 mg fl', qty: '5', category: 'FARMACI BORSELLO ROSSO - Cardiaci', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's174', name: 'Digossina 0.5 mg fl', qty: '2', category: 'FARMACI BORSELLO ROSSO - Cardiaci', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's175', name: 'Dobutamina 250 mg fl', qty: '2', category: 'FARMACI BORSELLO ROSSO - Cardiaci', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's176', name: 'Dopamina 200 mg fl', qty: '5', category: 'FARMACI BORSELLO ROSSO - Cardiaci', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's177', name: 'Furosemide 20 mg fl', qty: '5', category: 'FARMACI BORSELLO ROSSO - Cardiaci', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's178', name: 'Furosemide 250 mg fl', qty: '2', category: 'FARMACI BORSELLO ROSSO - Cardiaci', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's179', name: 'Labetalolo 100 mg fl', qty: '2', category: 'FARMACI BORSELLO ROSSO - Cardiaci', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's180', name: 'Levosimendan 2.5 mg/ml fl', qty: '1', category: 'FARMACI BORSELLO ROSSO - Cardiaci', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's181', name: 'Nitroglicerina 5 mg fl', qty: '2', category: 'FARMACI BORSELLO ROSSO - Cardiaci', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's182', name: 'Propafenone 70 mg fl', qty: '2', category: 'FARMACI BORSELLO ROSSO - Cardiaci', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's183', name: 'Salbutamolo fl', qty: '2', category: 'FARMACI BORSELLO ROSSO - Cardiaci', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's184', name: 'Urapidil 50 mg fl', qty: '2', category: 'FARMACI BORSELLO ROSSO - Cardiaci', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },

  // VARIE - Sez. C
  { id: 's185', name: 'Casco di protezione del capo', qty: 'X4', category: 'VARIE - Sez. C', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's186', name: 'Kit NBCR', qty: 'X4', category: 'VARIE - Sez. C', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' },
  { id: 's187', name: 'Kit Ebola', qty: 'X4', category: 'VARIE - Sez. C', mat: 'NON_RILEVATO', pom: 'NON_RILEVATO', not: 'NON_RILEVATO' }
];

export const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

export const MOCK_CREW_STATUSES: CrewStatus[] = [
  {
    crewId: 'C1',
    vehicleCode: 'TA-01',
    stationName: 'INDIA CENTRO',
    assignedServiceStation: 'TARANTO CENTRO',
    autistiStatus: { turn1: 'ok', turn2: 'ok', turn3: 'pending' },
    sanitariStatus: { mat: 'ok', pom: 'ok', not: 'pending' },
    lastUpdate: '2026-07-03 12:10'
  },
  {
    crewId: 'C2',
    vehicleCode: 'TA-04',
    stationName: 'Martina Franca',
    assignedServiceStation: 'Martina Franca 118',
    autistiStatus: { turn1: 'anomalia', turn2: 'ok', turn3: 'pending' },
    sanitariStatus: { mat: 'ok', pom: 'anomalia', not: 'pending' },
    lastUpdate: '2026-07-03 11:45'
  },
  {
    crewId: 'C3',
    vehicleCode: 'TA-08',
    stationName: 'Grottaglie',
    assignedServiceStation: 'Grottaglie 118',
    autistiStatus: { turn1: 'ok', turn2: 'pending', turn3: 'pending' },
    sanitariStatus: { mat: 'anomalia', pom: 'pending', not: 'pending' },
    lastUpdate: '2026-07-03 09:30'
  },
  {
    crewId: 'C4',
    vehicleCode: 'TA-12',
    stationName: 'Manduria',
    assignedServiceStation: 'Manduria Hospital',
    autistiStatus: { turn1: 'ok', turn2: 'ok', turn3: 'ok' },
    sanitariStatus: { mat: 'ok', pom: 'ok', not: 'ok' },
    lastUpdate: '2026-07-03 06:15'
  }
];

export const INITIAL_DEADLINE_NOTIFICATIONS: DeadlineNotification[] = [
  {
    id: 'n1',
    title: 'Adrenalina in scadenza',
    description: 'Il lotto di Adrenalina fl nella borsa termica dell\'equipaggio scade tra 3 giorni.',
    type: 'scadenza_farmaco',
    severity: 'high',
    dueDate: '2026-07-06',
    targetRole: 'sanitari'
  },
  {
    id: 'n2',
    title: 'Checklist Autista non completata',
    description: 'Il 2° turno per il mezzo corrente non è stato ancora firmato digitalmente.',
    type: 'mancata_compilazione',
    severity: 'medium',
    dueDate: 'Oggi (Fine turno)',
    targetRole: 'autisti'
  },
  {
    id: 'n3',
    title: 'Collaudo bombola O2 portatile',
    description: 'La bombola d\'ossigeno portatile da 3 lt necessita del collaudo periodico entro fine mese.',
    type: 'scadenza_bombola',
    severity: 'info',
    dueDate: '2026-07-31',
    targetRole: 'all'
  },
  {
    id: 'n4',
    title: 'Revisione Ministeriale Mezzo',
    description: 'La revisione del mezzo TA-01 scade il 15 del mese corrente.',
    type: 'revisione_mezzo',
    severity: 'high',
    dueDate: '2026-07-15',
    targetRole: 'autisti'
  }
];

export const PRESET_EMAIL_ADDRESSES = {
  pec_asl: 'direzione.generale@pec.asl.taranto.it',
  pec_sanita: 'referti.118@pec.sanitaservice.ta.it',
  email_coordinatore: 'coordinamento.soccorso118@asl.taranto.it',
  email_archivio: 'archivio.checklist@sanitaservicetaranto.it'
};


export const STATION_PRESETS = [
    { name: 'INDIA CENTRO', service: 'TARANTO CENTRO' },
    { name: 'INDIA SUD', service: 'TARANTO SUD' },
    { name: 'PPI 1 MASSAFRA', service: 'MASSAFRA' },
    { name: 'GINOSA', service: 'GINOSA' },
    { name: 'GINOSA MARINA', service: 'GINOSA MARINA' },
    { name: 'SAVA', service: 'SAVA' },
    { name: 'INDIA NORD', service: 'TARANTO NORD' },
    { name: 'INDIA MARTINA', service: 'MARTINA FRANCA' },
    { name: 'INDIA CRISPIANO', service: 'CRISPIANO' },
    { name: 'PULSANO', service: 'PULSANO' },
    { name: 'PPI6 GROTTAGLIE', service: 'GROTTAGLIE' },
    { name: 'MANDURIA', service: 'MANDURIA' },
    { name: 'CASTELLANETA', service: 'CASTELLANETA' },
    { name: 'LATERZA', service: 'LATERZA' },
    { name: 'MOTTOLA', service: 'MOTTOLA' },
    { name: 'INDIA TALSANO', service: 'TALSANO' },
    { name: 'TARANTO PORTO', service: 'TARANTO' },
    { name: 'TAMBURI', service: 'STATTE' },
    { name: 'PALAGIANO', service: 'PALAGIANO' },
    { name: 'SAN GIORGIO', service: 'SAN GIORGIO' },
    { name: 'SAN MARZANO', service: 'SAN MARZANO' },
    { name: 'TORRICELLA', service: 'TORRICELLA' },
    { name: 'AVETRANA', service: 'AVETRANA' },
    { name: 'MONTEMESOLA', service: 'MONTEMESOLA' },
    { name: 'BLS SAN PAOLO', service: 'SAN PAOLO' },
    { name: 'PPI5', service: 'TARANTO' },
    { name: 'AUTOMEDICA NORD', service: 'NORD' },
    { name: 'AUTOMEDICA SUD', service: 'PULSANO' },
    { name: 'AUTOMEDICA MARTINA FRANCA', service: 'MARTINA FRANCA' }
];
