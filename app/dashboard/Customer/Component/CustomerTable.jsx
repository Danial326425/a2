import React from 'react';
import CustomerRow from './CustomerRow';
import Pagination from './Pagination';

const CustomerTable = ({
  applications,
  fraudDetails,
  fraudThreshold,
  currentItems,
  selectedApplications,
  handleCheckboxChange,
  handleEditClick,
  handlePrintClick,
  handleDeleteClick,
  handleAddPoints,
  getStatusColor,
  showStatus,
  orderStatuses,
  fetchStatusOnClick,
  totalPages,
  currentPage,
  handlePageChange,
  activeTab,
  selectAll,
  handleSelectAllChange,
  handleImageClick,
  onUpdateStatus
}) => {


  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAllChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
            {/* <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th> */}
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Details</th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extras</th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
           
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentItems.map((app) => (
            <CustomerRow
              key={app.id}
              app={app}
              selected={selectedApplications.includes(app.id)}
              onCheckboxChange={handleCheckboxChange}
              onEditClick={handleEditClick}
              onPrintClick={handlePrintClick}
              onDeleteClick={handleDeleteClick}
              onAddPointsClick={handleAddPoints}
              getStatusColor={getStatusColor}
              showStatus={showStatus}
              orderStatuses={orderStatuses}
              fetchStatusOnClick={fetchStatusOnClick}
              activeTab={activeTab}
              fraudDetails={fraudDetails}
              fraudThreshold={fraudThreshold}
              handleImageClick={handleImageClick}
              onUpdateStatus={onUpdateStatus}

            />
          ))}
        </tbody>
      </table>

      {currentItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No orders found in this category.
        </div>
      )}

      <Pagination 
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        itemsPerPage={10}
        filteredApplications={currentItems}
      />
    </div>
  );
};

export default CustomerTable;