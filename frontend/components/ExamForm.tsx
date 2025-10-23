'use client';

import { useState } from 'react';
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

  // Validation
  const [touched, setTouched] = useState({ personalNumber: false, phoneNumber: false, email: false });
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPersonalNumber = personalNumber.length === 11;
  const isValidPhoneNumber = phoneNumber.trim().length >= 9;

  // Step 1: Fetch categories
  const handleFetchCategories = async () => {
    if (!personalNumber || !phoneNumber) {
      setError('გთხოვთ შეიყვანოთ სწორი მონაცემები');
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

    if (email && !isValidEmail(email)) {
      setError('გთხოვთ შეიყვანოთ სწორი ელ-ფოსტა');
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
    setTouched({ personalNumber: false, phoneNumber: false, email: false });
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <div className="card p-8 sm:p-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            QalaqiChecker
          </h1>
          <p className="text-gray-600 text-lg">მართვის მოწმობის გამოცდის შემოწმება</p>
        </div>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`flex-1 h-2.5 rounded-full transition-all duration-500 ${
                  i <= step ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-sm' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-500">
            <span className={step >= 1 ? 'text-primary-600' : ''}>პირადი ინფო</span>
            <span className={step >= 2 ? 'text-primary-600' : ''}>კატეგორია</span>
            <span className={step >= 3 ? 'text-primary-600' : ''}>ცენტრი</span>
            <span className={step >= 4 ? 'text-primary-600' : ''}>შედეგი</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 flex items-start gap-3 animate-slide-up">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                პირადი ნომერი <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={personalNumber}
                onChange={(e) => setPersonalNumber(e.target.value.replace(/\D/g, ''))}
                onBlur={() => setTouched({ ...touched, personalNumber: true })}
                maxLength={11}
                placeholder="01234567890"
                className={`input-field ${
                  touched.personalNumber && !isValidPersonalNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
                }`}
              />
              {touched.personalNumber && !isValidPersonalNumber && (
                <p className="mt-2 text-sm text-red-600">პირადი ნომერი უნდა შეიცავდეს 11 ციფრს</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ტელეფონის ნომერი <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onBlur={() => setTouched({ ...touched, phoneNumber: true })}
                placeholder="5XX XXX XXX"
                className={`input-field ${
                  touched.phoneNumber && !isValidPhoneNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
                }`}
              />
              {touched.phoneNumber && !isValidPhoneNumber && (
                <p className="mt-2 text-sm text-red-600">ტელეფონის ნომერი არასწორია</p>
              )}
            </div>
            <button
              onClick={handleFetchCategories}
              disabled={loading || !personalNumber || !phoneNumber}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  იტვირთება...
                </span>
              ) : (
                'შემდეგი'
              )}
            </button>
          </div>
        )}

        {/* Step 2: Select Category */}
        {step === 2 && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">აირჩიეთ კატეგორია</h2>
            <div className="space-y-3">
              {categories.map((category) => (
                <button
                  key={category.code}
                  onClick={() => handleSelectCategory(category)}
                  disabled={loading}
                  className="card-hover w-full p-5 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{category.name}</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="btn-secondary w-full mt-6"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                უკან
              </span>
            </button>
          </div>
        )}

        {/* Step 3: Select Center */}
        {step === 3 && (
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">აირჩიეთ ცენტრი</h2>
            <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2 -mr-2">
              {centers.map((center) => (
                <button
                  key={center.serviceCenterId}
                  onClick={() => {
                    setSelectedCenter(center);
                    handleCheckExam();
                  }}
                  disabled={loading}
                  className="card-hover w-full p-5 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{center.serviceCenterName}</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="btn-secondary w-full mt-6"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                უკან
              </span>
            </button>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && result && (
          <div className="space-y-6 animate-slide-up">
            {result.available ? (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-8">
                <div className="text-center mb-6">
                  <div className="text-7xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-green-700 mb-3">
                    გამოცდა ხელმისაწვდომია!
                  </h2>
                  <p className="text-green-600">დაჯავშნეთ ადგილი რაც შეიძლება სწრაფად</p>
                </div>
                <div className="bg-white rounded-xl p-6 space-y-3 mb-6 shadow-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">კატეგორია</p>
                      <p className="font-semibold text-gray-900">{result.category}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">ცენტრი</p>
                      <p className="font-semibold text-gray-900">{result.center}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">თარიღი</p>
                      <p className="font-semibold text-gray-900">{result.date}</p>
                    </div>
                  </div>
                </div>
                <a
                  href="https://my.gov.ge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 text-center shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  my.gov.ge-ზე გადასვლა →
                </a>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-8">
                <div className="text-center mb-6">
                  <div className="text-7xl mb-4">⏳</div>
                  <h2 className="text-3xl font-bold text-amber-700 mb-3">
                    გამოცდა არ არის ხელმისაწვდომი
                  </h2>
                  <p className="text-amber-600">{result.message}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    გსურთ შეტყობინების მიღება?
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">შევამოწმებთ ყოველ 15 წუთში და შეგატყობინებთ როდესაც ადგილი გამოჩნდება</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ელ-ფოსტა
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setTouched({ ...touched, email: true })}
                        placeholder="example@gmail.com"
                        className={`input-field ${
                          touched.email && email && !isValidEmail(email) ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : ''
                        }`}
                      />
                      {touched.email && email && !isValidEmail(email) && (
                        <p className="mt-2 text-sm text-red-600">ელ-ფოსტა არასწორია</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Telegram Chat ID
                      </label>
                      <input
                        type="text"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        placeholder="123456789"
                        className="input-field"
                      />
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Chat ID-ს მისაღებად დაწერეთ @userinfobot-ს Telegram-ში
                      </p>
                    </div>
                    <button
                      onClick={handleSubscribe}
                      disabled={loading}
                      className="btn-primary w-full"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          იტვირთება...
                        </span>
                      ) : (
                        'შეტყობინების გამოწერა'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={reset}
              className="btn-secondary w-full"
            >
              თავიდან დაწყება
            </button>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="text-center space-y-6 animate-slide-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              წარმატებით გამოიწერეთ!
            </h2>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed">
                ჩვენ შემოგიწმებთ გამოცდის ხელმისაწვდომობას <span className="font-bold text-green-700">ყოველ 15 წუთში</span> და
                გაგიგზავნით შეტყობინებას როდესაც ადგილი გამოჩნდება.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="btn-primary flex-1"
              >
                დასრულება
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="mt-8 text-center text-sm text-gray-500 space-y-2">
        <p className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          ეს სერვისი იყენებს საჯარო my.gov.ge API-ს
        </p>
        <p>მონაცემები იტვირთება პირდაპირ ოფიციალური წყაროდან</p>
      </div>
    </div>
  );
}
