import React from "react";

const UpdatePaymentMethod = ({ formData, handleChange, handleImageChange, handleSubmit, loading, error, onCancel, imagePreview }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <div onClick={onCancel} className="flex justify-end cursor-pointer">Close</div>
      <h2 className="text-2xl font-bold mb-4">Update Payment Method</h2>

      {loading && <p className="text-blue-500 mb-4">Updating...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Payment Method */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Payment Method</label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
          >
            <option value="">Select Payment Method</option>
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Rocket">Rocket</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash on Delivery">Cash on Delivery</option>
          </select>
        </div>

        {/* Payment Number */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Payment Number/Account</label>
          <input
            type="text"
            name="payment_number"
            value={formData.payment_number}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
            placeholder="e.g. 017XXXXXXXX"
          />
        </div>

        {/* Image */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium">Payment Method Image (QR/Logo)</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            className="border w-full p-2 rounded"
            accept="image/*"
          />
          {imagePreview && (
            <div className="mt-2">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="h-32 object-contain border rounded"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Payment Method"}
        </button>
      </form>
    </div>
  );
};

export default UpdatePaymentMethod;