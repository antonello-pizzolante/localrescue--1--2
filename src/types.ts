export interface UserSession {
  role: 'sanitari' | 'autisti' | 'consultazione' | 'foglio_marcia';
  operatorName: string; // Used for Driver name in autisti, or main operator in sanitari
  vehicleCode: string;
  stationName: string;
  assignedServiceStation: string;
  loginTime: string;
  operatorRescuerName?: string; // Rescuer name
  operatorDriverSignature?: string; // Signature Data URL for driver
  operatorRescuerSignature?: string; // Signature Data URL for rescuer
  qualification?: 'infermiere' | 'medico'; // Qualification for sanitari
  targa?: string; // Targa for foglio_marcia
}

export type ValueMinNormMax = 'MIN' | 'NORM' | 'MAX' | '';
export type ValueSiNo = 'SI' | 'NO' | '';
export type CheckStatus = 'OK' | 'ANOMALIA' | 'NON_RILEVATO';

export interface AutistaActivity {
  id: string;
  name: string;
  type: 'standard' | 'select_min_norm_max' | 'select_si_no' | 'number_input';
  category: 'controlli' | 'vano_sanitario' | 'presidi_diagnostici';
  turn1: { status: CheckStatus; val: string };
  turn2: { status: CheckStatus; val: string };
  turn3: { status: CheckStatus; val: string };
}

export interface DamageMarker {
  id: string;
  type: 'O' | 'X'; // O: Ammaccatura/Urto, X: Graffio
  x: number; // percentage from left
  y: number; // percentage from top
  part: string; // e.g. "Frontale", "Posteriore", "Fianco Destro", "Fianco Sinistro", "Tetto"
  description?: string;
  photoDataUrl?: string; // Optional photo of the damage
}

export interface AutistiChecklistReport {
  id: string;
  date: string;
  vehicleCode: string;
  stationName: string;
  assignedServiceStation: string;
  operator1?: string;
  operator2?: string;
  operator3?: string;
  activities: AutistaActivity[];
  damages: DamageMarker[];
  notes: string;
  driverSignature?: string;
  rescuerSignature?: string;
  signatures: {
    turn1?: { name: string; signatureDataUrl: string; rescuerName?: string; rescuerSignatureDataUrl?: string; timestamp: string };
    turn2?: { name: string; signatureDataUrl: string; rescuerName?: string; rescuerSignatureDataUrl?: string; timestamp: string };
    turn3?: { name: string; signatureDataUrl: string; rescuerName?: string; rescuerSignatureDataUrl?: string; timestamp: string };
  };
  emailSent: boolean;
  pecSent: boolean;
  isSynced: boolean;
}

export interface SanitariChecklistItem {
  id: string;
  name: string;
  qty: string;
  category: string;
  mat: CheckStatus;
  pom: CheckStatus;
  not: CheckStatus;
}

export interface PharmacyItem {
  id: string;
  name: string;
  expiryDate?: string;
  notes?: string;
  quantityToOrder?: number;
  qtyText?: string;
  type: 'scadenza' | 'ordine';
}

export interface SanitariChecklistReport {
  id: string;
  date: string;
  vehicleCode: string;
  stationName: string;
  assignedServiceStation: string;
  operatorMat?: string;
  operatorPom?: string;
  operatorNot?: string;
  items: SanitariChecklistItem[];
  notes?: string;
  signatures: {
    mat?: { name: string; signatureDataUrl: string; timestamp: string };
    pom?: { name: string; signatureDataUrl: string; timestamp: string };
    not?: { name: string; signatureDataUrl: string; timestamp: string };
  };
  emailSent: boolean;
  pecSent: boolean;
  isSynced: boolean;
  pharmacyExpiringMeds?: PharmacyItem[];
  pharmacyOrders?: PharmacyItem[];
}

export interface CrewStatus {
  crewId: string;
  vehicleCode: string;
  stationName: string;
  assignedServiceStation: string;
  autistiStatus: {
    turn1: 'pending' | 'ok' | 'anomalia';
    turn2: 'pending' | 'ok' | 'anomalia';
    turn3: 'pending' | 'ok' | 'anomalia';
  };
  sanitariStatus: {
    mat: 'pending' | 'ok' | 'anomalia';
    pom: 'pending' | 'ok' | 'anomalia';
    not: 'pending' | 'ok' | 'anomalia';
  };
  lastUpdate: string;
}

export interface DeadlineNotification {
  id: string;
  title: string;
  description: string;
  type: 'scadenza_farmaco' | 'mancata_compilazione' | 'scadenza_bombola' | 'revisione_mezzo';
  severity: 'high' | 'medium' | 'info';
  dueDate: string;
  targetRole: 'sanitari' | 'autisti' | 'all';
}

export interface RevisioneMezzo {
  id: string;
  vehicleCode: string; // Targa o codice mezzo
  type: 'revisione' | 'tagliando' | 'assicurazione' | 'bollo';
  expiryDate: string; // Data di scadenza
  lastPerformedDate?: string; // Data ultimo effettuato
  km?: number; // Chilometri al tagliando/revisione
  notes?: string;
  createdAt: string;
}
