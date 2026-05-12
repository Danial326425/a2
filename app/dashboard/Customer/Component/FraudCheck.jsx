import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const FraudCheck = ({ phoneNumber, fraudDetails, checkFraudDetails }) => {
  // বর্তমান ফোন নাম্বারের ডাটা এক্সেস করুন
  const currentDetails = fraudDetails[phoneNumber] || {};

  return (
    <div className="border-t pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-gray-700">Fraud Verification</h3>
          <button
            onClick={() => checkFraudDetails(phoneNumber)}
            className="flex items-center gap-1 text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
            disabled={currentDetails.loading}
          >
            <FaExclamationTriangle />
            {currentDetails.loading ? 'Checking...' : 'Check Fraud Details'}
          </button>
        </div>
        {currentDetails.loading && (
          <span className="text-xs text-gray-500 flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
        )}
      </div>

      {currentDetails.data && (
        <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Total Parcels:</span>
                <span className="text-sm text-gray-800">
                  {currentDetails.data.total_parcels || currentDetails.data.total_orders || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Total Delivered:</span>
                <span className="text-sm text-gray-800">
                  {currentDetails.data.total_delivered || 0}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Total Cancelled:</span>
                <span className="text-sm text-gray-800">
                  {currentDetails.data.total_cancelled || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Fraud Reports:</span>
                <span className={`text-sm ${
                  (currentDetails.data.total_fraud_reports?.length || 0) > 0 
                    ? 'text-red-600 font-semibold' 
                    : 'text-green-600'
                }`}>
                  {(currentDetails.data.total_fraud_reports?.length || 0) > 0 ? (
                    `${currentDetails.data.total_fraud_reports.length} reports found`
                  ) : (
                    'No fraud reports'
                  )}
                </span>
              </div>
            </div>
          </div>

          {(currentDetails.data.total_fraud_reports?.length || 0) > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Report Details:</h4>
              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                <ul className="space-y-1.5 text-xs text-red-700">
                  {currentDetails.data.total_fraud_reports.map((report, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block mr-1.5 mt-0.5">•</span>
                      <span>{report.reason || report.message || report}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {currentDetails.error && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded">
          {currentDetails.error}
        </div>
      )}
    </div>
  );
};

export default FraudCheck;