import React from 'react';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaUndo, 
  FaPauseCircle,
  FaExclamationTriangle,
  FaEye,
  FaPlusCircle,
  FaMinusCircle
} from 'react-icons/fa';
import StatusActions from './StatusActions';
import FraudCheck from './FraudCheck';
import { config } from '../../../../config';

const CustomerRow = ({ 
  app, 
  selected, 
  onCheckboxChange, 
  onEditClick, 
  onPrintClick, 
  onDeleteClick,
  onAddPointsClick,
  getStatusColor,
  showStatus,
  orderStatuses,
  fetchStatusOnClick,
  onUpdateStatus,
  activeTab,
  fraudDetails,
  handleImageClick,
  checkFraudDetails,

}) => {

  return (
    <React.Fragment>
      <tr className="hover:bg-gray-50">
        <td className="px-2 py-4 whitespace-nowrap">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onCheckboxChange(app.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </td>
        <td className="px-2 py-4 whitespace-nowrap">
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{app.customer_name}</span>
            <span className="text-xs text-gray-500">{app.order_id}</span>
            <span className="text-xs text-gray-500">
              {new Date(app.created_at).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
            <span className="text-sm text-gray-700">{app.phone_number}</span>
            {app.payment_number && app.transaction_id && (
              <>
                <span className="text-sm text-gray-700">{app.payment_method}: {app.payment_number}</span>
                <span className="text-sm text-gray-700">Tnx Id: {app.transaction_id}</span>
              </>
            )}
            
            {app.delivery_status && (
              <div className="flex items-center mt-1">
                {app.delivery_status === 'delivered' && (
                  <>
                    <FaCheckCircle className="text-green-500 text-xs mr-1" />
                    <span className="text-xs text-green-600 font-medium">Delivered</span>
                  </>
                )}
                {app.delivery_status === 'cancelled' && (
                  <>
                    <FaTimesCircle className="text-red-500 text-xs mr-1" />
                    <span className="text-xs text-red-600 font-medium">Cancelled</span>
                  </>
                )}
                {app.delivery_status === 'return' && (
                  <>
                    <FaUndo className="text-yellow-500 text-xs mr-1" />
                    <span className="text-xs text-yellow-600 font-medium">Return</span>
                  </>
                )}
                {app.delivery_status === 'hold' && (
                  <>
                    <FaPauseCircle className="text-blue-500 text-xs mr-1" />
                    <span className="text-xs text-blue-600 font-medium">Hold</span>
                  </>
                )}
                {app.delivery_status === 'blocked' && (
                  <>
                    <FaPauseCircle className="text-blue-500 text-xs mr-1" />
                    <span className="text-xs text-blue-600 font-medium">Blocked</span>
                  </>
                )}
                {!['delivered', 'cancelled', 'return', 'hold', 'blocked'].includes(app.delivery_status) && (
                  <>
                    <FaExclamationTriangle className="text-red-500 text-xs mr-1" />
                    <span className="text-xs text-red-600 font-medium">{app.delivery_status}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </td>
        <td className="px-2 py-4">
          <div className="text-sm text-gray-500">{app.customer_address}</div>
        </td>
        {/* <td className="px-2 py-4">
         
        </td> */}
        <td className="px-2 py-4">
          <div className='mb-4'>
            <div className="text-sm text-gray-900">{app.product_name}</div>
            <div className="text-xs text-gray-500">
              {[app.color, app.size, app.quantity && `Qty: ${app.quantity}`]
              .filter(Boolean)
              .join(" • ")}
            </div>
          </div>
          <div className="text-sm text-gray-900">
            <div className="flex items-center flex-wrap gap-2">
              {app.items && app.items.length > 0 ? (
                app.items.map((item, index) => {
                  // Product এর মাধ্যমে images access
                  const hasProductImages = item.product_images && item.product_images.length > 0;
                  const hasColors = item.colors && item.colors.length > 0;
                  
                  return (
                    <div key={`${item.id}-${index}`}>
                      {hasProductImages ? (
                        <img
                          src={`${config.imageUrl}/${item.product_images[0].image}`}
                          alt={`Product Image ${index + 1}`}
                          onClick={() => handleImageClick(item)}
                          className="w-8 h-8 rounded-full cursor-pointer hover:opacity-75 transition-opacity"
                        />
                      ) : hasColors ? (
                        <img
                          src={`${config.imageUrl}/${item.colors[0].image}`}
                          alt={`Product Image ${index + 1}`}
                          onClick={() => handleImageClick(item)}
                          className="w-8 h-8 rounded-full cursor-pointer hover:opacity-75 transition-opacity"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-500">
                          No Img
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-gray-400">No items</div>
              )}
            </div>
          </div>
        </td>
        <td className="px-2 py-4">
          {app.order_bumps?.length > 0 && (
            <div className="mt-1 text-xs">
              <div className="font-medium text-gray-600">Special Offers:</div>
              {app.order_bumps.map((bump, index) => (
                <div key={index} className="flex items-center">
                  <FaPlusCircle className="text-blue-500 text-xs mr-1" />
                  <span>{bump.bump?.title || `Additional Product #${index + 1}`}: ৳{bump.price}</span>
                </div>
              ))}
            </div>
          )}
          {app.bulk_discounts?.length > 0 && (
            <div className="mt-1 text-xs">
              <div className="font-medium text-gray-600">Combo Discounts:</div>
              {app.bulk_discounts.map((discount, index) => (
                <div key={index} className="flex items-center">
                  <FaMinusCircle className="text-red-500 text-xs mr-1" />
                  <span> -৳{Math.floor(app.product_price * discount.discount_percentage / 100)}</span>
                </div>
              ))}
            </div>
          )}
        </td>
        <td className="px-2 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
          {app.consignment_id ? (
            <div 
              className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(app.consignment_id);
                alert(`কপি হয়েছে: ${app.consignment_id}`);
              }}
              title="ক্লিক করে কপি করুন"
            >
              <svg 
                className="w-3 h-3 mr-1 text-blue-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <span>Consignment ID: <span className="font-medium">{app.consignment_id}</span></span>
            </div>
          ) : (
            <div className="flex items-center bg-red-50 text-red-700 px-2 py-1 rounded-md text-xs">
              <svg 
                className="w-3 h-3 mr-1 text-red-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>Awaiting Shipment</span>
            </div>
          )}
        </div>
          <div className="flex items-center p-4">
            <button
              onClick={() => fetchStatusOnClick(app.id)}
              className="mr-2 text-blue-500 hover:text-blue-700"
              title="Check Status"
            >
              <FaEye className="text-sm" />
            </button>
              {showStatus[app.id] === 'loading' ? (
                <span className="text-xs text-gray-500">Loading...</span>
              ) : (
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(orderStatuses[app.order_id] || showStatus[app.id])}`}>
                  {orderStatuses[app.order_id] || showStatus[app.id]}
                </span>
              )}
          </div>
        </td>
        <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          ৳{app.total}
        </td>
        <td className="px-2 py-4 whitespace-nowrap space-x-1">
          <button
            onClick={() => onEditClick(app)}
            className="text-blue-600 hover:text-blue-900 text-xs font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onPrintClick(app)}
            className="text-purple-600 hover:text-purple-900 text-xs font-medium"
          >
            Print
          </button>
          <button
            onClick={() => onDeleteClick(app.id)}
            className="text-red-600 hover:text-red-900 text-xs font-medium"
          >
            Delete
          </button>
          {!app.delivery_status && activeTab === 'delivered' && (
            <button
              onClick={() => onAddPointsClick(app.id)}
              className="text-green-600 hover:text-green-900 text-xs font-medium"
            >
              Points
            </button>
          )}
        </td>
      </tr>
      
      <tr className="bg-gray-50">
        <td colSpan="9" className="px-4 py-4">
          {/* <StatusActions 
            appId={app.id}
            phoneNumber={app.phone_number}
            onUpdateStatus={onUpdateStatus}
          /> */}
        
          <FraudCheck 
            appId={app.id}
            customerName={app.customer_name}
            phoneNumber={app.phone_number}
            fraudDetails={fraudDetails}
            checkFraudDetails={checkFraudDetails} 
          />
        </td>
      </tr>
    </React.Fragment>
  );
};

export default CustomerRow;