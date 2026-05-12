"use client";

import React, { useState } from "react";
import axios from "axios";

const UpdateTransaction = ({ formData, handleChange, handleSubmit, loading, error }) => {
 
  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Update Transaction</h2>

      {/* Display Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Transaction Number */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Transaction Number</label>
          <input
            type="text"
            name="tnxNumber"
            value={formData.tnxNumber}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter transaction number"
            required
          />
        </div>

        {/* Transaction ID */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Transaction ID</label>
          <input
            type="text"
            name="tnxId"
            value={formData.tnxId}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter transaction ID"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Transaction"}
        </button>
      </form>
    </div>
  );
};

export default UpdateTransaction;
