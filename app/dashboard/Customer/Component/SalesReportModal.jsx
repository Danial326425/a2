import React from 'react';
import { FaTimesCircle } from 'react-icons/fa';

const SalesReportModal = ({ 
  isOpen, 
  onClose, 
  report,
  onExportCSV 
}) => {
  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">
            Sales Report: {report.startDate} to {report.endDate}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimesCircle className="text-xl" />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="text-sm font-medium text-blue-700">Total Orders</h4>
              <p className="text-2xl font-bold text-blue-900">{report.totalOrders}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h4 className="text-sm font-medium text-green-700">Total Sales</h4>
              <p className="text-2xl font-bold text-green-900">৳{report.totalSales.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h4 className="text-sm font-medium text-purple-700">Delivered</h4>
              <p className="text-2xl font-bold text-purple-900">{report.deliveredOrders}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h4 className="text-sm font-medium text-yellow-700">Pending</h4>
              <p className="text-2xl font-bold text-yellow-900">{report.pendingOrders}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.order_id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{order.customer_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{order.phone_number}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">৳{order.total}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        !order.delivery_status ? 'bg-gray-100 text-gray-800' :
                        order.delivery_status.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.delivery_status.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.delivery_status || 'Not Confirm'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onExportCSV}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Export to CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReportModal;