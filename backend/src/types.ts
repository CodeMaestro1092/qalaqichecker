export interface User {
  id: string;
  personalNumber: string;
  phoneNumber: string;
  categoryCode: number;
  categoryName: string;
  centerId: number;
  centerName: string;
  email?: string;
  telegramChatId?: string;
  lastChecked?: string;
  notified?: boolean;
}

export interface Category {
  code: number;
  name: string;
}

export interface ServiceCenter {
  serviceCenterId: number;
  serviceCenterName: string;
}

export interface ExamDate {
  examDate: string;
}

export interface ExamCheckResult {
  available: boolean;
  date?: string;
  center?: string;
  category?: string;
  message?: string;
}

export interface ActiveRequest {
  hasActiveRequest: boolean;
  message?: string;
}
