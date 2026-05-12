import React from "react";

const UpdateLead = ({ formData, handleChange, handleSubmit, loading, error, onCancel }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <div onClick={onCancel} className="flex justify-end cursor-pointer">Close</div>
      <h2 className="text-2xl font-bold mb-4">Update Lead</h2>

      {loading && <p className="text-blue-500 mb-4">Updating...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Customer Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Customer Name</label>
          <input
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
          />
        </div>

        {/* Phone Number */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Phone Number</label>
          <input
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
          />
        </div>

        {/* Customer Address */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Customer Address</label>
          <textarea
            name="customer_address"
            value={formData.customer_address}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            rows="3"
          />
        </div>

        {/* Product Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Product Name</label>
          <input
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            className="border w-full p-2 rounded"
          />
        </div>

        {/* Product Price */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Product Price</label>
          <input
            type="number"
            name="product_price"
            value={formData.product_price}
            onChange={handleChange}
            className="border w-full p-2 rounded"
          />
        </div>

        {/* Quantity */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            min="1"
          />
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border w-full p-2 rounded"
          >
            <option value="lead">Lead</option>
            <option value="converted">Converted</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Lead"}
        </button>
      </form>
    </div>
  );
};

export default UpdateLead;