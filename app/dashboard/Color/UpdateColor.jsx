import React from "react";
import { config } from "../../../config";

const UpdateColor = ({ formData, handleChange, handleSubmit, setVideo,uploadProgress, loading, error }) => {
  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Update Live Page</h2>

      {/* Display Loading State */}
      {loading && <p className="text-blue-500 mb-4">Updating...</p>}

      {/* Display Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Slug */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Slug</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter slug"
          />
        </div>

        {/* Video Upload */}
        <div className="mb-4">
          {uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className="bg-blue-600 h-4 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            >
              <span className="text-white text-xs font-bold">{uploadProgress}%</span>
            </div>
          </div>
          )}
          <label className="block text-gray-700 font-medium">Video</label>
          {formData.video && (
            <video controls className="mb-2">
              <source src={`${config.videoUrl}/${formData.video}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
          <input
            type="file"
            name="video"
            onChange={(e) => setVideo(e.target.files[0])}
            accept="video/*"
            className="border w-full p-2"
          />
        </div>

        {/* Seen People */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Seen People</label>
          <input
            type="number"
            name="seenPeople"
            value={formData.seenPeople}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter the number of people seen"
          />
        </div>

        {/* Offer Headline */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Offer Headline</label>
          <input
            type="text"
            name="offerHeadline"
            value={formData.offerHeadline}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter offer headline"
          />
        </div>

        {/* Offer Paragraph */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Offer Paragraph</label>
          <textarea
            name="offerParagraph"
            value={formData.offerParagraph}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter offer paragraph"
          ></textarea>
        </div>

        {/* Offer Button Text */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Offer Button Text</label>
          <input
            type="text"
            name="offerButton"
            value={formData.offerButton}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter offer button text"
          />
        </div>

        {/* Offer Time */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Offer Time</label>
          <input
            type="text"
            name="offerTime"
            value={formData.offerTime}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter offer time"
          />
        </div>


         {/* Redirect Page */}
         <div className="mb-4">
          <label className="block text-gray-700 font-medium">Payment Page/Offer Page</label>
          <input
            type="text"
            name="redirectPage"
            value={formData.redirectPage}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter Redirect Page"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Live Page"}
        </button>
      </form>
    </div>
  );
};

export default UpdateColor;
