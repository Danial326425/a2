import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  onSearch,
  onResetSearch,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onApplyDateFilter,
  onGenerateReport,
  onResetDateFilter,
  dateFilterApplied,
  searchError
}) => {
  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <div className="flex items-center gap-2">
            <DatePicker
              selected={startDate}
              onChange={onStartDateChange}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">to</span>
            <DatePicker
              selected={endDate}
              onChange={onEndDateChange}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={onApplyDateFilter}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Filter Orders
          </button>
          <button
            onClick={onGenerateReport}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Generate Report
          </button>
          {dateFilterApplied && (
            <button
              onClick={onResetDateFilter}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Search functionality */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Customers (OrderId, Name, Phone, or Address)
          </label>
          <input
            type="text"
            id="search"
            placeholder="Enter OrderId, name, phone or address..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          <button
            onClick={onResetSearch}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      {searchError && (
        <div className="mt-2 text-sm text-red-600">
          {searchError}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;