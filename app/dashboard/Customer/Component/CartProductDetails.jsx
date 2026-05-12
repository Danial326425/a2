import React from 'react'
import { FaTimesCircle } from 'react-icons/fa'
import { config } from '../../../../config'

const CartProductDetails = ({showProductModal, setShowProductModal, selectedProductDetails}) => {


  return (
    <div>
      {showProductModal && selectedProductDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-xl w-full">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold">Product Details</h3>
                <button 
                onClick={() => setShowProductModal(false)}
                className="text-gray-500 hover:text-gray-700"
                >
                <FaTimesCircle className="text-xl" />
                </button>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <h4 className="text-sm font-medium text-gray-500">Product Name</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedProductDetails.product_name}</p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-500">Color</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedProductDetails.color || 'N/A'}</p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-500">Size</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedProductDetails.size || 'N/A'}</p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-500">Quantity</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedProductDetails.quantity}</p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-500">Price</h4>
                    <p className="mt-1 text-sm text-gray-900">৳{selectedProductDetails.price}</p>
                </div>
                </div>
                
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Product Images</h4>
                         <div className="flex flex-wrap gap-2">
                            {selectedProductDetails.product_images && selectedProductDetails.product_images.length > 0 ? (
                                selectedProductDetails.product_images?.map((image, index) => (
                                    <img
                                        key={index}
                                        src={`${config.imageUrl}/${image.image}`}
                                        alt={`Product ${index + 1}`}
                                        className="w-40 h-40 object-cover rounded-md"
                                    />  
                                    ))
                                ) : (
                                   selectedProductDetails.colors && selectedProductDetails.colors.length > 0 ? (
                                    selectedProductDetails.colors.map((color, index) => (
                                        <div key={index} className="w-40 h-40 flex items-center justify-center bg-gray-200 rounded-md"> 
                                            <img
                                                key={index}
                                                src={`${config.imageUrl}/${color.image}`}
                                                alt={`Product ${index + 1}`}
                                                className="w-40 h-40 object-cover rounded-md"
                                            /> 
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-40 h-40 flex items-center justify-center bg-gray-200 rounded-md">
                                        <span className="text-gray-500">No Image</span>
                                    </div>
                                ))
                            }
                    
                        </div>
                    </div>
                </div>
            </div>
        </div>
        )}
    </div>
  )
}

export default CartProductDetails
