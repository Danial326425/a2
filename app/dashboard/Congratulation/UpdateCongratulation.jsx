import React from "react";
import { config } from "../../../config";

const imageUrl = config.imageUrl;

const UpdateCongratulation = ({ formData, handleChange, handleSubmit, loading, error }) => {
  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Update Congratulation Page</h2>

      {/* Display Loading State */}
      {loading && <p className="text-blue-500 mb-4">Updating...</p>}

      {/* Display Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Headline */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Headline</label>
          <input
            type="text"
            name="headline"
            value={formData.headline}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter headline"
            required
          />
        </div>

        {/* Sub Headline */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Sub Headline</label>
          <input
            type="text"
            name="subHeadline"
            value={formData.subHeadline}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter sub headline"
          />
        </div>

        {/* Paragraph */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Paragraph</label>
          <textarea
            name="paragraph"
            value={formData.paragraph}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter paragraph text"
          ></textarea>
        </div>

        {/* Contact Info Text */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Contact Info Text</label>
          <input
            type="text"
            name="contactInfoText"
            value={formData.contactInfoText}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter contact info text"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Congratulation Page"}
        </button>
      </form>
    </div>
  );
};

export default UpdateCongratulation;
