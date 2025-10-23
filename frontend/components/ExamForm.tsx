'use client';

import { useState, useEffect } from 'react';
import { api, Category, ServiceCenter, ExamCheckResult } from '@/utils/api';

export default function ExamForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ExamCheckResult | null>(null);

  // Form data
  const [personalNumber, setPersonalNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);
  const [email, setEmail] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');

  // Step 1: Fetch categories
  const handleFetchCategories = async () => {
    if (!personalNumber || personalNumber.length !== 11) {
      setError('გთხოვთ შეიყვანოთ სწორი პირადი ნომერი (11 ციფრი)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.getCategories(personalNumber);
      if (data.length === 0) {
        setError('კატეგორიები არ მოიძებნა. შეამოწმეთ პირადი ნომერი.');
        setLoading(false);
        return;
      }
      setCategories(data);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'შეცდომა კატეგორიების ჩატვირთვისას');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Fetch centers
  const handleSelectCategory = async (category: Category) => {
    setSelectedCategory(category);
    setLoading(true);
    setError('');

    try {
      const data = await api.getCenters(category.code);
      if (data.length === 0) {
        setError('ცენტრები არ მოიძებნა ამ კატეგორიისთვის');
        setLoading(false);
        return;
      }
      setCenters(data);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'შეცდომა ცენტრების ჩატვირთვისას');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Check exam
  const handleCheckExam = async () => {
    if (!selectedCenter || !selectedCategory) return;

    setLoading(true);
    setError('');

    try {
      const data = await api.checkExam(
        personalNumber,
        selectedCategory.code,
        selectedCenter.serviceCenterId
      );
      setResult(data);
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || 'შეცდომა გამოცდის შემოწმებისას');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Subscribe for notifications
  const handleSubscribe = async () => {
    if (!email && !telegramChatId) {
      setError('გთხოვთ შეიყვანოთ მინიმუმ ერთი საკონტაქტო მეთოდი');
      return;
    }

    if (!selectedCategory || !selectedCenter) return;

    setLoading(true);
    setError('');

    try {
      await api.subscribe({
        personalNumber,
        phoneNumber,
        categoryCode: selectedCategory.code,
        categoryName: selectedCategory.name,
        centerId: selectedCenter.serviceCenterId,
        centerName: selectedCenter.serviceCenterName,
        email: email || undefined,
        telegramChatId: telegramChatId || undefined,
      });
      setStep(5);
    } catch (err: any) {
      setError(err.response?.data?.message || 'შეცდომა გამოწერისას');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setPersonalNumber('');
    setPhoneNumber('');
    setCategories([]);
    setSelectedCategory(null);
    setCenters([]);
    setSelectedCenter(null);
    setEmail('');
    setTelegramChatId('');
    setResult(null);
    setError('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">
            🚗 QalaqiChecker
          </h1>
          <p className="text-gray-600">მართვის მოწმობის გამოცდის შემოწმება</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-1/4 h-2 rounded ${
                  i <= step ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>პირადი ინფო</span>
            <span>კატეგორია</span>
            <span>ცენტრი</span>
            <span>შედეგი</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                პირადი ნომერი *
              </label>
              <input
                type="text"
                value={personalNumber}
                onChange={(e) => setPersonalNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={11}
                placeholder="01234567890"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ტელეფონის ნომერი *
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="5XX XXX XXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleFetchCategories}
              disabled={loading || !personalNumber || !phoneNumber}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {loading ? 'იტვირთება...' : 'შემდეგი'}
            </button>
          </div>
        )}

        {/* Step 2: Select Category */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">აირჩიეთ კატეგორია</h2>
            {categories.map((category) => (
              <button
                key={category.code}
                onClick={() => handleSelectCategory(category)}
                disabled={loading}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-left disabled:opacity-50"
              >
                <div className="font-medium">{category.name}</div>
              </button>
            ))}
            <button
              onClick={() => setStep(1)}
              className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← უკან
            </button>
          </div>
        )}

        {/* Step 3: Select Center */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">აირჩიეთ ცენტრი</h2>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {centers.map((center) => (
                <button
                  key={center.serviceCenterId}
                  onClick={() => {
                    setSelectedCenter(center);
                    handleCheckExam();
                  }}
                  disabled={loading}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-left disabled:opacity-50"
                >
                  <div className="font-medium">{center.serviceCenterName}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full mt-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← უკან
            </button>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && result && (
          <div className="space-y-6">
            {result.available ? (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">🎉</div>
                  <h2 className="text-2xl font-bold text-green-700 mb-2">
                    გამოცდა ხელმისაწვდომია!
                  </h2>
                </div>
                <div className="space-y-2 text-gray-700">
                  <p><strong>კატეგორია:</strong> {result.category}</p>
                  <p><strong>ცენტრი:</strong> {result.center}</p>
                  <p><strong>თარიღი:</strong> {result.date}</p>
                </div>
                <a
                  href="https://my.gov.ge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 text-center"
                >
                  my.gov.ge-ზე გადასვლა
                </a>
              </div>
            ) : (
              <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-6">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">⏳</div>
                  <h2 className="text-2xl font-bold text-yellow-700 mb-2">
                    გამოცდა არ არის ხელმისაწვდომი
                  </h2>
                  <p className="text-gray-600">{result.message}</p>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg">
                  <h3 className="font-semibold mb-4">გსურთ შეტყობინების მიღება?</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ელ-ფოსტა (არასავალდებულო)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telegram Chat ID (არასავალდებულო)
                      </label>
                      <input
                        type="text"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        placeholder="123456789"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Chat ID-ს მისაღებად დაწერეთ @userinfobot-ს
                      </p>
                    </div>
                    <button
                      onClick={handleSubscribe}
                      disabled={loading}
                      className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                      {loading ? 'იტვირთება...' : 'შეტყობინების გამოწერა'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              თავიდან დაწყება
            </button>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-700">
              წარმატებით გამოიწერეთ!
            </h2>
            <p className="text-gray-600">
              ჩვენ შემოგიწმებთ გამოცდის ხელმისაწვდომობას ყოველ 15 წუთში და გაგიგზავნით
              შეტყობინებას როდესაც ადგილი გამოჩნდება.
            </p>
            <button
              onClick={reset}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700"
            >
              კარგი
            </button>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          ეს სერვისი იყენებს საჯარო my.gov.ge API-ს
        </p>
        <p className="mt-2">
          მონაცემები იტვირთება პირდაპირ ოფიციალური წყაროდან
        </p>
      </div>
    </div>
  );
}
