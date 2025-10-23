import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Category {
  code: number;
  name: string;
}

export interface ServiceCenter {
  serviceCenterId: number;
  serviceCenterName: string;
}

export interface ExamCheckResult {
  available: boolean;
  date?: string;
  center?: string;
  category?: string;
  message?: string;
}

export interface SubscribeData {
  personalNumber: string;
  phoneNumber: string;
  categoryCode: number;
  categoryName: string;
  centerId: number;
  centerName: string;
  email?: string;
  telegramChatId?: string;
}

export const api = {
  async getCategories(personalNumber: string): Promise<Category[]> {
    const response = await axios.get(`${API_URL}/api/exam/categories`, {
      params: { personalNumber },
    });
    return response.data;
  },

  async getCenters(categoryCode: number): Promise<ServiceCenter[]> {
    const response = await axios.get(`${API_URL}/api/exam/centers`, {
      params: { categoryCode },
    });
    return response.data;
  },

  async checkExam(
    personalNumber: string,
    categoryCode: number,
    centerId: number
  ): Promise<ExamCheckResult> {
    const response = await axios.post(`${API_URL}/api/exam/check`, {
      personalNumber,
      categoryCode,
      centerId,
    });
    return response.data;
  },

  async subscribe(data: SubscribeData): Promise<any> {
    const response = await axios.post(`${API_URL}/api/exam/subscribe`, data);
    return response.data;
  },
};
