import { apiClient } from './apiClient';
import { ExamCheckResult, User } from '../types';

export async function checkExamAvailability(
  personalNumber: string,
  categoryCode: number,
  centerId: number
): Promise<ExamCheckResult> {
  try {
    // Check if user has active request
    const activeRequest = await apiClient.checkActiveRequest(personalNumber);
    if (activeRequest.hasActiveRequest) {
      return {
        available: false,
        message: 'თქვენ უკვე გაქვთ აქტიური განაცხადი',
      };
    }

    // Get available exam dates for the specific center and category
    const examDates = await apiClient.getExamDates(categoryCode, centerId);

    if (examDates.length > 0) {
      // Get center name
      const centers = await apiClient.getCenters(categoryCode);
      const center = centers.find(c => c.serviceCenterId === centerId);

      // Get category name
      const categories = await apiClient.getCategories(personalNumber);
      const category = categories.find(c => c.code === categoryCode);

      return {
        available: true,
        date: examDates[0].examDate,
        center: center?.serviceCenterName || 'უცნობი ცენტრი',
        category: category?.name || 'უცნობი კატეგორია',
        message: 'გამოცდა ხელმისაწვდომია!',
      };
    }

    return {
      available: false,
      message: 'ამჟამად გამოცდა არ არის ხელმისაწვდომი',
    };
  } catch (error: any) {
    if (error.message === 'RATE_LIMITED') {
      return {
        available: false,
        message: 'API შეზღუდულია. გთხოვთ სცადოთ 30 წუთში',
      };
    }
    return {
      available: false,
      message: 'შეცდომა მოხდა API-ს გამოძახებისას',
    };
  }
}

export async function checkUserExam(user: User): Promise<ExamCheckResult> {
  return checkExamAvailability(user.personalNumber, user.categoryCode, user.centerId);
}
