import React from 'react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaUndo,
  FaPauseCircle,
  FaExclamationTriangle,
  FaEye,
  FaPlusCircle,
  FaMinusCircle,
  FaGift
} from 'react-icons/fa';
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
  fraudThreshold,
  checkFraudDetails,
  handleImageClick,
}) => {
  const fd = fraudDetails?.[app.id];
  const d = fd?.data;
  const total = d ? Number(d.total_parcels ?? d.total_orders ?? 0) : 0;
  const delivered = d ? Number(d.total_delivered ?? 0) : 0;
  const failed = d ? Number(d.total_cancelled ?? 0) : 0;
  const pending = Math.max(0, total - delivered - failed);
  const deliveredPct = total > 0 ? Math.round((delivered / total) * 100) : 0;
  const failedPct = total > 0 ? Math.round((failed / total) * 100) : 0;
  const pendingPct = Math.max(0, 100 - deliveredPct - failedPct);
  const finalized = delivered + failed;
  const steadfastSpam =
    fraudThreshold > 0 &&
    finalized >= 3 &&
    d &&
    (delivered / finalized) * 100 < fraudThreshold;
  const showSpam = !!app.is_spam || steadfastSpam;

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
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{app.customer_name}</span>
              {showSpam && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                  SPAM
                </span>
              )}
            </div>
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
            {/* Courier stats: show button until fetched */}
            {!fd && (
              <button
                onClick={() => checkFraudDetails?.(app.phone_number, app.id)}
                className="mt-1 text-[10px] text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition-colors"
              >
                Courier Stats দেখুন
              </button>
            )}
            {fd?.loading && (
              <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                <svg className="animate-spin w-2.5 h-2.5 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Loading…
              </span>
            )}
            {fd?.error && (
              <span className="text-[10px] text-red-500 mt-1 flex items-center gap-1 flex-wrap">
                ⚠ {fd.error}
                <button
                  onClick={() => checkFraudDetails?.(app.phone_number, app.id)}
                  className="text-blue-500 hover:text-blue-700 underline ml-1"
                >
                  Retry
                </button>
              </span>
            )}
            {d && total > 0 && (
              <div className="mt-1 w-44">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden flex">
                  {deliveredPct > 0 && (
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${deliveredPct}%` }}
                      title={`Delivered: ${deliveredPct}%`}
                    />
                  )}
                  {failedPct > 0 && (
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${failedPct}%` }}
                      title={`Returned: ${failedPct}%`}
                    />
                  )}
                  {pendingPct > 0 && (
                    <div
                      className="h-full bg-gray-300"
                      style={{ width: `${pendingPct}%` }}
                      title={`Pending: ${pendingPct}%`}
                    />
                  )}
                </div>
                <div className="text-[10px] text-gray-600 mt-0.5 leading-tight">
                  <span className="font-semibold">{total}</span> Orders:
                  {' '}<span className="text-green-600 font-semibold">{delivered} Delivered ({deliveredPct}%)</span>
                  {failed > 0 && (
                    <>, <span className="text-red-600 font-semibold">{failed} Returned ({failedPct}%)</span></>
                  )}
                  {pending > 0 && (
                    <>, <span className="text-gray-500 font-semibold">{pending} Pending ({pendingPct}%)</span></>
                  )}
                </div>
              </div>
            )}
            {d && total === 0 && (
              <span className="text-[10px] text-gray-400 mt-1">No courier history</span>
            )}
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

          {app.upsell_product_id && (
            <div className="mt-2 pt-2 border-t border-gray-100 text-xs">
              <div className="font-medium text-gray-600 mb-1 flex items-center gap-1">
                <FaGift className="text-red-400" /> আপসেল:
                <span className={`ml-1 px-1.5 py-0.5 rounded-full font-semibold ${
                  app.upsell_status === 'accepted'
                    ? 'bg-green-100 text-green-700'
                    : app.upsell_status === 'declined'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {app.upsell_status === 'accepted' ? '✓ Accepted'
                    : app.upsell_status === 'declined' ? '✗ Declined'
                    : 'Pending'}
                </span>
              </div>
              {/* Show multiple accepted items if available */}
              {app.upsell_status === 'accepted' && Array.isArray(app.upsell_items) && app.upsell_items.length > 0 ? (
                <div className="space-y-1">
                  {app.upsell_items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-green-50 rounded-lg px-2 py-1">
                      {item.image ? (
                        <img
                          src={`/api/storage/${item.image}`}
                          alt={item.name}
                          className="w-8 h-8 rounded object-contain border bg-white flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-400 flex-shrink-0 text-base">
                          🎁
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-700 font-medium truncate block">{item.name}</span>
                        <div className="flex items-center gap-1 text-gray-500">
                          {item.size && <span className="bg-gray-200 rounded px-1 text-xs">{item.size}</span>}
                          <span className="text-red-600 font-bold">৳{item.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {app.upsell_price && (
                    <div className="text-right text-red-600 font-bold pt-0.5">মোট: ৳{app.upsell_price}</div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {app.upsell_product?.image ? (
                    <img
                      src={`/api/storage/${app.upsell_product.image}`}
                      alt={app.upsell_product.name}
                      className="w-8 h-8 rounded object-contain border bg-gray-50 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-400 flex-shrink-0 text-base">
                      🎁
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-700 truncate">{app.upsell_product?.name || '—'}</div>
                    {app.upsell_price && (
                      <div className="text-red-600 font-semibold">৳{app.upsell_price}</div>
                    )}
                  </div>
                </div>
              )}
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
      
    </React.Fragment>
  );
};

export default CustomerRow;