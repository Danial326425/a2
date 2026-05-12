import React from "react";
import { config } from "../../../config";

const imageUrl = config.imageUrl;

const UpdateSize = ({ formData, handleChange, handleQuillChange, handleSubmit, loading, error }) => {
  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Update Size Page</h2>

      {/* Display Loading State */}
      {loading && <p className="text-blue-500 mb-4">Updating...</p>}

      {/* Display Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Color Id */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Top Bar</label>
          <input
            type="text"
            name="color_id"
            value={formData.color_id}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter top bar text"
          />
        </div>

        {/* Headline */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Headline</label>
          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter headline"
            required
          />
        </div>


        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Size You Page"}
        </button>
      </form>
    </div>
  );
};

export default UpdateSize;
