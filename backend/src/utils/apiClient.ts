import axios, { AxiosError } from 'axios';
import { Category, ServiceCenter, ExamDate, ActiveRequest } from '../types';

const BASE_URL = 'https://api-my.sa.gov.ge/api/v1/DrivingLicensePracticalExams2';
const API_DELAY = parseInt(process.env.API_DELAY_MS || '5000');

// Rate limiting helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ApiClient {
  private lastCallTime = 0;

  private async throttle() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    if (timeSinceLastCall < API_DELAY) {
      await sleep(API_DELAY - timeSinceLastCall);
    }
    this.lastCallTime = Date.now();
  }

  async checkActiveRequest(personalNumber: string): Promise<ActiveRequest> {
    await this.throttle();
    try {
      const response = await axios.get(
        `${BASE_URL}/DriverLicenseActiveRequest2`,
        {
          params: { PersonalNumber: personalNumber },
          timeout: 10000,
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getCategories(personalNumber: string): Promise<Category[]> {
    await this.throttle();
    try {
      const response = await axios.get(
        `${BASE_URL}/DrivingLicenseExamsCategories2`,
        {
          params: { PersonalNumber: personalNumber },
          timeout: 10000,
        }
      );
      return response.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getCenters(categoryCode: number): Promise<ServiceCenter[]> {
    await this.throttle();
    try {
      const response = await axios.get(
        `${BASE_URL}/DrivingLicenseExamsCenters2`,
        {
          params: { CategoryCode: categoryCode },
          timeout: 10000,
        }
      );
      return response.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async getExamDates(categoryCode: number, centerId: number): Promise<ExamDate[]> {
    await this.throttle();
    try {
      const response = await axios.get(
        `${BASE_URL}/DrivingLicenseExamsDates2`,
        {
          params: { CategoryCode: categoryCode, CenterId: centerId },
          timeout: 10000,
        }
      );
      return response.data || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  private handleError(error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 429) {
        console.error('Rate limited by API. Waiting 30 minutes...');
        throw new Error('RATE_LIMITED');
      }
      console.error('API Error:', axiosError.response?.status, axiosError.message);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

export const apiClient = new ApiClient();
