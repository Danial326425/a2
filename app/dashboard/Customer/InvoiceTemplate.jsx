"use client";

import React, { useEffect, useState, useRef } from "react";
import { config } from "../../../config";
import axios from "axios";
import { FaPlusCircle, FaMinusCircle } from 'react-icons/fa';

const InvoiceTemplate = React.forwardRef(({ order, logoUrl }, ref) => {
  const apiUrl = config.apiUrl;
  const steadfastApiUrl = 'https://portal.packzy.com/api/v1';
  const imageUrl = config.imageUrl;
  const [logo, setLogo] = useState([]); // ডেটা স্টেট 
  const [loading, setLoading] = useState(true); // লোডিং স্টেট

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/websitelogos`); // API থেকে ডেটা ফেচ করা
        setLogo(response.data[0].logo); // ডেটা সেট করা
      } catch (error) {
        console.error("Error fetching data:", error?.data?.message || error.message); // ত্রুটি লগ করা
      } finally {
        setLoading(false); // লোডিং বন্ধ করা
      }
    };

    fetchData();
  }, []);

  return (
    <div ref={ref} className="p-6 max-w-4xl mx-auto bg-white">
      {/* Invoice Header */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        {logoUrl && (
          <div className="w-32">
            <img src={`${imageUrl}/${logo}`} alt="Company Logo" className="w-full h-auto" />
          </div>
        )}
        <div className="text-right">
          <h1 className="text-2xl font-bold">INVOICE</h1>
          <p className="text-gray-600">#{order.order_id}</p>
        </div>
      </div>

      {/* Customer and Date Info */}
      <div className="flex justify-between mb-8">
        <div>
          <h2 className="font-bold text-lg">Bill To:</h2>
          <p>{order.customer_name}</p>
          <p>{order.customer_address}</p>
          <p>Phone: {order.phone_number}</p>
        </div>
        <div className="text-right">
          <p><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Order Items */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left border">Product</th>
            <th className="py-2 px-4 text-left border">Color</th>
            <th className="py-2 px-4 text-left border">Size</th>
            <th className="py-2 px-4 text-left border">Qty</th>
            <th className="py-2 px-4 text-left border">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2 px-4 border">{order.product_name}</td>
            <td className="py-2 px-4 border">{order.color}</td>
            <td className="py-2 px-4 border">{order.size}</td>
            <td className="py-2 px-4 border">{order.quantity}</td>
            <td className="py-2 px-4 border">৳{order.product_price}</td>
          </tr>
          
          {/* Order Bumps */}
          {order.order_bumps && order.order_bumps.length > 0 && (
            <>
              {order.order_bumps.map((bump, index) => (
                <tr key={`bump-${index}`}>
                  <td className="py-2 px-4 border">
                    <div className="flex items-center">
                      <FaPlusCircle className="text-blue-500 text-xs mr-2" />
                      {bump.bump?.title || `Special Offer #${index + 1}`}
                    </div>
                  </td>
                  <td className="py-2 px-4 border">-</td>
                  <td className="py-2 px-4 border">-</td>
                  <td className="py-2 px-4 border">1</td>
                  <td className="py-2 px-4 border">৳{bump.price}</td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>

      {/* Total and Footer */}
      <div className="flex justify-end mb-4">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b">
            <span className="font-bold">Subtotal:</span>
            <span>৳{order.product_price}</span>
          </div>
          
          {/* Order Bumps Subtotal */}
          {order.order_bumps && order.order_bumps.length > 0 && (
            <div className="flex justify-between py-2 border-b">
              <span className="font-bold">Special Offers:</span>
              <span>৳{order.order_bumps.reduce((sum, bump) => sum + Number(bump.price), 0)}</span>
            </div>
          )}
          
          {/* Bulk Discounts */}
          {order.bulk_discounts && order.bulk_discounts.length > 0 && (
            <div className="flex justify-between py-2 border-b text-red-600">
              <span className="font-bold">Combo Discount:</span>
              <span>-৳{order.bulk_discounts.reduce((sum, discount) => sum + Math.floor(order.product_price * discount.discount_percentage / 100), 0)}</span>
            </div>
          )}

          <div className="flex justify-between py-2 border-b">
            <span className="font-bold">Shipping:</span>
            <span>৳{order.delivery_charge}</span>
          </div>
          
          {order.coins_used > 0 && 
            <div className="flex justify-between py-2 border-b">
              <span className="font-bold">Discount:</span>
              <span>-৳{order.coins_used}</span>
            </div>
          }

          <div className="flex justify-between py-2 font-bold text-lg">
            <span>Total:</span>
            <span>৳{order.total}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
        <p>Thank you for your Purchase!</p>
        <p>For any queries, please contact our customer support.</p>
      </div>
    </div>
  );
});

export default InvoiceTemplate;