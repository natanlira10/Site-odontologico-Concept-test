export type TreatmentCategory = 'estetica' | 'implantes' | 'ortodontia' | 'reabilitacao';

export interface Treatment {
  id: string;
  name: string;
  category: TreatmentCategory;
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  duration: string;
  discomfortLevel: 'Zero' | 'Mínimo' | 'Leve' | 'Controlado';
  recoveryTime: string;
  recommendedSessions: number;
  highlightTag: string;
  imageUrl: string;
  features: string[];
  startingPriceEstimate?: string;
}

export interface Doctor {
  id: string;
  name: string;
  cro: string;
  title: string;
  specialty: string;
  bio: string;
  avatarUrl: string;
  education: string[];
  supportedTreatments: string[];
}

export interface TimeSlot {
  id: string;
  occupied?: boolean;
  startsAt?: string;
  time: string;
  period: 'manha' | 'tarde' | 'noite';
  available: boolean;
}

export interface BookingRequest {
  startsAt: string;
  treatmentName: string;
  doctorName: string;
  treatmentId: string;
  doctorId: string;
  date: string;
  timeSlot: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientCpf: string;
  notes?: string;
  isFirstVisit: boolean;
}

export interface BookingConfirmation {
  protocol: string;
  status: 'confirmed' | 'pending';
  treatmentName: string;
  doctorName: string;
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  location: string;
  createdAt: string;
}

export interface UserCredentials {
  email: string;
  password?: string;
  cpf?: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  cpf: string;
  phone: string;
  password?: string;
  birthDate?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  role: 'patient' | 'admin' | 'dentist';
  dentistId?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}

export interface Testimonial {
  id: string;
  patientName: string;
  role: string;
  treatmentTaken: string;
  comment: string;
  rating: number;
  avatarUrl: string;
}

export interface BeforeAfterCase {
  id: string;
  title: string;
  category: string;
  treatmentName: string;
  beforeImage: string;
  afterImage: string;
  summary: string;
}

export type AppointmentStatus = 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';

export interface AdminAppointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  treatmentId: string;
  treatmentName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  protocol: string;
  createdAt: string;
}

export interface SlotTogglePayload {
  dentistId: string;
  date: string;
  time: string;
  available: boolean;
}

export interface ReschedulePayload {
  appointmentId: string;
  newDate: string;
  newTime: string;
  reason?: string;
}
