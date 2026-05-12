import React from "react";
import { config } from "../../../config";

const UpdateCommunity = ({ 
  formData, 
  handleChange, 
  handleSubmit, 
  setIcon,
  setImage,
  setBanner,
  uploadProgress, 
  loading, 
  error 
}) => {
  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Update Community</h2>

      {loading && <p className="text-blue-500 mb-4">Updating...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

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

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            rows="3"
          />
        </div>

         <div className="mb-4">
          <label className="block text-gray-700 mb-2">Button Text</label>
          <input
            type="text"
            name="button_text"
            value={formData.button_text}
            onChange={handleChange}
            className="border w-full p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium">URL</label>
          <input
            type="text"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="border w-full p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <input
            type="text"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            className="border w-full p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Image</label>
          {formData.image && (
            <img 
              src={`${config.imageUrl}/${formData.image}`} 
              alt="Community Image" 
              className="mb-2 w-full h-48 object-cover"
            />
          )}
          <input
            type="file"
            name="image"
            onChange={(e) => setImage(e.target.files[0])}
            accept="image/*"
            className="border w-full p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Banner</label>
          {formData.banner && (
            <img 
              src={`${config.imageUrl}/${formData.banner}`} 
              alt="Community Banner" 
              className="mb-2 w-full h-32 object-cover"
            />
          )}
          <input
            type="file"
            name="banner"
            onChange={(e) => setBanner(e.target.files[0])}
            accept="image/*"
            className="border w-full p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Community"}
        </button>
      </form>
    </div>
  );
};

export default UpdateCommunity;