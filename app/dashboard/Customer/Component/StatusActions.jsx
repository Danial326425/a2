import React from 'react';
import { FaCheck, FaExclamationTriangle, FaPauseCircle } from 'react-icons/fa';

const StatusActions = ({ appId, phoneNumber, onUpdateStatus }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <button
          onClick={() => onUpdateStatus(appId, 'delivered')}
          className="flex items-center justify-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
        >
          <FaCheck className="text-green-600" />
          <span className="text-sm font-medium">Delivered</span>
        </button>
        <button
          onClick={() => onUpdateStatus(appId, 'cancelled')}
          className="flex items-center justify-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
        >
          <FaExclamationTriangle className="text-red-600" />
          <span className="text-sm font-medium">Cancelled</span>
        </button>
        <button
          onClick={() => onUpdateStatus(appId, 'return')}
          className="flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg border border-yellow-100 hover:bg-yellow-100 transition-colors"
        >
          <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span className="text-sm font-medium">Return</span>
        </button>
        <button
          onClick={() => onUpdateStatus(appId, 'hold')}
          className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
        >
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <span className="text-sm font-medium">Hold</span>
        </button>
        <button
          onClick={() => onUpdateStatus(appId, 'blocked')}
          className="flex items-center justify-center gap-2 bg-blue-50 text-red-700 px-3 py-2 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
        >
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <span className="text-sm font-medium">Blocked</span>
        </button>
      </div>
    </div>
  );
};

export default StatusActions;