import React from "react";

const UpdateForm = ({ formData, handleChange, handleSubmit, loading, error }) => {
  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Update Lead</h2>

      {/* Display Loading State */}
      {loading && <p className="text-blue-500 mb-4">Updating...</p>}

      {/* Display Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Lead Headline */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Lead Headline</label>
          <input
            type="text"
            name="leadHeadline"
            value={formData.leadHeadline}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter lead headline"
            required
          />
        </div>

        {/* Lead Button Headline */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Lead Button Headline</label>
          <input
            type="text"
            name="leadButtonHeadline"
            value={formData.leadButtonHeadline}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter lead button headline"
            required
          />
        </div>

        {/* Lead Button Sub Headline */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Lead Button Sub Headline</label>
          <input
            type="text"
            name="leadButtonSubHeadline"
            value={formData.leadButtonSubHeadline}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter lead button sub headline"
          />
        </div>

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

        {/* Redirect Page */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Redirect Page</label>
          <input
            type="text"
            name="redirectPage"
            value={formData.redirectPage}
            onChange={handleChange}
            className="border w-full p-2"
            placeholder="Enter redirect page URL"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Lead"}
        </button>
      </form>
    </div>
  );
};

export default UpdateForm;
