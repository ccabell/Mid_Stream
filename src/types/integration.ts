/**
 * Integration types for A360 ↔ External System data flow visualization
 */

export type IntegrationType = 'zenoti' | 'ghl' | 'nextech';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'not_configured';

export type SyncDirection = 'inbound' | 'outbound' | 'bidirectional';

export type SyncStatus = 'success' | 'failed' | 'pending' | 'partial';

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  status: IntegrationStatus;
  lastSyncAt?: string;
  tokenExpiresAt?: string;
  errorMessage?: string;
  config?: Record<string, unknown>;
}

export interface EntityMapping {
  id: string;
  integrationType: IntegrationType;
  a360Entity: string;
  externalEntity: string;
  syncDirection: SyncDirection;
  description: string;
  fieldMappings: FieldMapping[];
}

export interface FieldMapping {
  id: string;
  a360Field: string;
  a360FieldType: string;
  externalField: string;
  externalFieldType: string;
  syncDirection: SyncDirection;
  required: boolean;
  transform?: string;
  notes?: string;
}

export interface DataFlowNode {
  id: string;
  type: 'system' | 'entity' | 'process';
  label: string;
  system?: 'a360' | 'zenoti' | 'ghl' | 'nextech';
  status?: IntegrationStatus;
  position: { x: number; y: number };
}

export interface DataFlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  direction: SyncDirection;
  animated?: boolean;
}

// Mock data for integrations
export const INTEGRATIONS: Integration[] = [
  {
    id: 'ghl-1',
    type: 'ghl',
    name: 'GoHighLevel',
    status: 'connected',
    lastSyncAt: '2026-03-14T10:30:00Z',
    tokenExpiresAt: '2026-03-15T10:30:00Z',
  },
  {
    id: 'zenoti-1',
    type: 'zenoti',
    name: 'Zenoti',
    status: 'not_configured',
  },
  {
    id: 'nextech-1',
    type: 'nextech',
    name: 'NexTech',
    status: 'not_configured',
  },
];

// Entity mappings based on integration documentation
export const ENTITY_MAPPINGS: EntityMapping[] = [
  // Zenoti Mappings
  {
    id: 'zenoti-patient-guest',
    integrationType: 'zenoti',
    a360Entity: 'Patient',
    externalEntity: 'Guest',
    syncDirection: 'bidirectional',
    description: 'Patient records sync with Zenoti Guest records',
    fieldMappings: [
      {
        id: 'z-pg-1',
        a360Field: 'patient.id',
        a360FieldType: 'UUID',
        externalField: 'guest_id',
        externalFieldType: 'string',
        syncDirection: 'inbound',
        required: true,
        notes: 'Primary key link',
      },
      {
        id: 'z-pg-2',
        a360Field: 'patient.first_name',
        a360FieldType: 'string',
        externalField: 'first_name',
        externalFieldType: 'string',
        syncDirection: 'bidirectional',
        required: true,
      },
      {
        id: 'z-pg-3',
        a360Field: 'patient.last_name',
        a360FieldType: 'string',
        externalField: 'last_name',
        externalFieldType: 'string',
        syncDirection: 'bidirectional',
        required: true,
      },
      {
        id: 'z-pg-4',
        a360Field: 'patient.email',
        a360FieldType: 'string',
        externalField: 'email',
        externalFieldType: 'string',
        syncDirection: 'bidirectional',
        required: true,
      },
      {
        id: 'z-pg-5',
        a360Field: 'patient.phone',
        a360FieldType: 'string',
        externalField: 'mobile_phone',
        externalFieldType: 'string',
        syncDirection: 'bidirectional',
        required: false,
      },
      {
        id: 'z-pg-6',
        a360Field: 'patient.date_of_birth',
        a360FieldType: 'date',
        externalField: 'dob',
        externalFieldType: 'string',
        syncDirection: 'inbound',
        required: false,
      },
      {
        id: 'z-pg-7',
        a360Field: 'patient.notes',
        a360FieldType: 'text',
        externalField: 'notes',
        externalFieldType: 'string',
        syncDirection: 'outbound',
        required: false,
        notes: 'KPI summaries pushed here',
      },
    ],
  },
  {
    id: 'zenoti-consultation-appointment',
    integrationType: 'zenoti',
    a360Entity: 'Consultation',
    externalEntity: 'Appointment',
    syncDirection: 'bidirectional',
    description: 'Consultations sync with Zenoti Appointments',
    fieldMappings: [
      {
        id: 'z-ca-1',
        a360Field: 'consultation.zenoti_appointment_id',
        a360FieldType: 'string',
        externalField: 'appointment_id',
        externalFieldType: 'string',
        syncDirection: 'inbound',
        required: true,
        notes: 'Link key',
      },
      {
        id: 'z-ca-2',
        a360Field: 'consultation.patient_id',
        a360FieldType: 'UUID',
        externalField: 'guest_id',
        externalFieldType: 'string',
        syncDirection: 'inbound',
        required: true,
        notes: 'Via guest mapping',
      },
      {
        id: 'z-ca-3',
        a360Field: 'consultation.start_time',
        a360FieldType: 'timestamp',
        externalField: 'start_time',
        externalFieldType: 'datetime',
        syncDirection: 'inbound',
        required: true,
      },
      {
        id: 'z-ca-4',
        a360Field: 'consultation.end_time',
        a360FieldType: 'timestamp',
        externalField: 'end_time',
        externalFieldType: 'datetime',
        syncDirection: 'inbound',
        required: false,
      },
      {
        id: 'z-ca-5',
        a360Field: 'consultation.provider_id',
        a360FieldType: 'UUID',
        externalField: 'therapist_id',
        externalFieldType: 'string',
        syncDirection: 'inbound',
        required: false,
        notes: 'Via employee mapping',
      },
      {
        id: 'z-ca-6',
        a360Field: 'consultation.status',
        a360FieldType: 'string',
        externalField: 'status',
        externalFieldType: 'string',
        syncDirection: 'bidirectional',
        required: true,
      },
      {
        id: 'z-ca-7',
        a360Field: 'consultation.soap_note',
        a360FieldType: 'text',
        externalField: 'notes',
        externalFieldType: 'string',
        syncDirection: 'outbound',
        required: false,
        notes: 'SOAP notes pushed back',
      },
    ],
  },
  {
    id: 'zenoti-service-service',
    integrationType: 'zenoti',
    a360Entity: 'PracticeService',
    externalEntity: 'Service',
    syncDirection: 'inbound',
    description: 'Service catalog synced from Zenoti',
    fieldMappings: [
      {
        id: 'z-ss-1',
        a360Field: 'practice_service.zenoti_service_id',
        a360FieldType: 'string',
        externalField: 'service_id',
        externalFieldType: 'string',
        syncDirection: 'inbound',
        required: true,
      },
      {
        id: 'z-ss-2',
        a360Field: 'practice_service.name',
        a360FieldType: 'string',
        externalField: 'name',
        externalFieldType: 'string',
        syncDirection: 'inbound',
        required: true,
      },
      {
        id: 'z-ss-3',
        a360Field: 'practice_service.category_id',
        a360FieldType: 'UUID',
        externalField: 'category',
        externalFieldType: 'string',
        syncDirection: 'inbound',
        required: false,
        notes: 'Via category mapping',
      },
      {
        id: 'z-ss-4',
        a360Field: 'practice_service.price',
        a360FieldType: 'decimal',
        externalField: 'price',
        externalFieldType: 'number',
        syncDirection: 'inbound',
        required: false,
      },
      {
        id: 'z-ss-5',
        a360Field: 'practice_service.duration_minutes',
        a360FieldType: 'integer',
        externalField: 'duration_minutes',
        externalFieldType: 'number',
        syncDirection: 'inbound',
        required: false,
      },
    ],
  },
  {
    id: 'zenoti-user-employee',
    integrationType: 'zenoti',
    a360Entity: 'User (Provider)',
    externalEntity: 'Employee',
    syncDirection: 'inbound',
    description: 'Providers synced from Zenoti Employees',
    fieldMappings: [
      {
        id: 'z-ue-1',
        a360Field: 'user.zenoti_employee_id',
        a360FieldType: 'string',
        externalField: 'employee_id',
        externalFieldType: 'string',
        syncDirection: 'inbound',
        required: true,
      },
      {
        id: 'z-ue-2',
        a360Field: 'user.first_name',
        a360FieldType: 'string',
        externalField: 'first_name',
        externalFieldType: 'string',
        syncDirection: 'inbound',
        required: true,
      },
      {
        id: 'z-ue-3',
        a360Field: 'user.last_name',
        a360FieldType: 'string',
        externalField: 'last_name',
        externalFieldType: 'string',
        syncDirection: 'inbound',
        required: true,
      },
      {
        id: 'z-ue-4',
        a360Field: 'user.email',
        a360FieldType: 'string',
        externalField: 'email',
        externalFieldType: 'string',
        syncDirection: 'inbound',
        required: true,
        notes: 'Match key',
      },
      {
        id: 'z-ue-5',
        a360Field: 'user.role',
        a360FieldType: 'string',
        externalField: 'role',
        externalFieldType: 'string',
        syncDirection: 'inbound',
        required: false,
        notes: 'Mapped to A360 roles',
      },
    ],
  },
  // GHL Mappings
  {
    id: 'ghl-patient-contact',
    integrationType: 'ghl',
    a360Entity: 'Patient',
    externalEntity: 'Contact',
    syncDirection: 'outbound',
    description: 'Patients pushed to GHL as Contacts for marketing',
    fieldMappings: [
      {
        id: 'g-pc-1',
        a360Field: 'patient.ghl_contact_id',
        a360FieldType: 'string',
        externalField: 'id',
        externalFieldType: 'string',
        syncDirection: 'inbound',
        required: true,
        notes: 'Stored after creation - CURRENTLY NOT IMPLEMENTED',
      },
      {
        id: 'g-pc-2',
        a360Field: 'patient.email',
        a360FieldType: 'string',
        externalField: 'email',
        externalFieldType: 'string',
        syncDirection: 'outbound',
        required: true,
      },
      {
        id: 'g-pc-3',
        a360Field: 'patient.first_name',
        a360FieldType: 'string',
        externalField: 'firstName',
        externalFieldType: 'string',
        syncDirection: 'outbound',
        required: true,
      },
      {
        id: 'g-pc-4',
        a360Field: 'patient.last_name',
        a360FieldType: 'string',
        externalField: 'lastName',
        externalFieldType: 'string',
        syncDirection: 'outbound',
        required: true,
      },
      {
        id: 'g-pc-5',
        a360Field: 'patient.phone',
        a360FieldType: 'string',
        externalField: 'phone',
        externalFieldType: 'string',
        syncDirection: 'outbound',
        required: false,
      },
    ],
  },
  {
    id: 'ghl-opportunity',
    integrationType: 'ghl',
    a360Entity: 'Opportunity',
    externalEntity: 'Opportunity',
    syncDirection: 'outbound',
    description: 'A360 extracted opportunities pushed to GHL pipeline',
    fieldMappings: [
      {
        id: 'g-op-1',
        a360Field: 'opportunity.service_id',
        a360FieldType: 'UUID',
        externalField: 'pipelineStageId',
        externalFieldType: 'string',
        syncDirection: 'outbound',
        required: true,
        notes: 'Mapped to GHL pipeline stage',
      },
      {
        id: 'g-op-2',
        a360Field: 'opportunity.estimated_value',
        a360FieldType: 'decimal',
        externalField: 'monetaryValue',
        externalFieldType: 'number',
        syncDirection: 'outbound',
        required: false,
      },
      {
        id: 'g-op-3',
        a360Field: 'opportunity.status',
        a360FieldType: 'string',
        externalField: 'status',
        externalFieldType: 'string',
        syncDirection: 'outbound',
        required: true,
      },
      {
        id: 'g-op-4',
        a360Field: 'opportunity.patient_intent',
        a360FieldType: 'string',
        externalField: 'customFields.intent',
        externalFieldType: 'string',
        syncDirection: 'outbound',
        required: false,
      },
    ],
  },
];
