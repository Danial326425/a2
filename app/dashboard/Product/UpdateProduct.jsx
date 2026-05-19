"use client";

import React, { useState, useEffect } from "react";
import { ImCross } from "react-icons/im";
import axios from "axios";
import QuillEditor from "../../components/QuillEditor";
import { config } from "../../../config";

const apiUrl = config.apiUrl;

const UpdateProduct = ({
  formData,
  setFormData,
  handleSubmit,
  onCancel,
  categories,
  showHomepageFields,
  setShowHomepageFields,
  showBulkDiscounts,
  setShowBulkDiscounts,
  showBumps,
  setShowBumps,
  handleImageChange,
  handleColorImageChange,
  handleBumpImageChange,
  showSingleProductSizes,
  setShowSingleProductSizes,
  removeImage,
  showUpsell,
  setShowUpsell,
  upsellProducts = [],
}) => {
  const [addOffer, setAddOffer]               = useState(!!formData.discount_price);
  const [addColors, setAddColors]             = useState(formData.colors.length > 0);
  const [error, setError]                     = useState(null);
  const [colorPresets, setColorPresets]       = useState([]);
  const [sizePresets, setSizePresets]         = useState([]);
  const [sizeGroupPresets, setSizeGroupPresets] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.get(`${apiUrl}/color-presets`).then(r => setColorPresets(r.data || [])),
      axios.get(`${apiUrl}/size-presets`).then(r => setSizePresets(r.data || [])),
      axios.get(`${apiUrl}/size-group-presets`).then(r => setSizeGroupPresets(r.data || [])),
    ]).catch(() => {});
  }, []);

  const imageUrl = config.imageUrl;


  // ইমেজ URL তৈরি করার helper function
  const getImageUrl = (image) => {
    if (!image) return null;
    
    // যদি File object হয়
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    
    // যদি existing ইমেজ object হয় (backend থেকে আসা)
    if (typeof image === 'object' && image.image) {
      return imageUrl + '/' + image.image;
    }
    
    // যদি existing ইমেজ string হয়
    if (typeof image === 'string') {
      return imageUrl + '/' + image;
    }
    
    // অন্য কোন type হলে null return করুন
    return null;
  };

  // Memory cleanup এর জন্য
  useEffect(() => {
    return () => {
      // Component unmount হলে সব Object URLs cleanup করুন
      formData.images.forEach(image => {
        const url = getImageUrl(image);
        if (url && image instanceof File) {
          URL.revokeObjectURL(url);
        }
      });
      
      formData.colors.forEach(color => {
        if (color.image) {
          const url = getImageUrl(color.image);
          if (url && color.image instanceof File) {
            URL.revokeObjectURL(url);
          }
        }
      });
      
      formData.bumps.forEach(bump => {
        if (bump.image) {
          const url = getImageUrl(bump.image);
          if (url && bump.image instanceof File) {
            URL.revokeObjectURL(url);
          }
        }
      });
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Checkboxes carry their state in `checked`, not `value` (which is "on"
    // by default for unkeyed checkboxes). Without this branch, toggling a
    // checkbox OFF actually set the field to the string "on" instead of false,
    // so it could never be un-checked from the dashboard.
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleHomepageChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        [name]: value
      }
    }));
  };

  const handleQuillChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        "description": value
      }
    }));
  };

  const handleColorChange = (index, e) => {
    const newColors = [...formData.colors];
    newColors[index].color = e.target.value;
    setFormData(prev => ({ ...prev, colors: newColors }));
  };

  const handleBulkDiscountChange = (index, e) => {
    const { name, value } = e.target;
    const bulk_discounts = [...formData.bulk_discounts];
    bulk_discounts[index][name] = value;
    setFormData(prev => ({ ...prev, bulk_discounts }));
  };

  const addBulkDiscount = () => {
    setFormData(prev => ({
      ...prev,
      bulk_discounts: [...(prev.bulk_discounts || []), { title: "", offer_quantity: "", discount_percentage: "" }]
    }));
  };

  const removeBulkDiscount = (index) => {
    const bulk_discounts = [...formData.bulk_discounts];
    bulk_discounts.splice(index, 1);
    setFormData(prev => ({ ...prev, bulk_discounts }));
  };

  const handleSizeChange = (colorIndex, sizeIndex, e) => {
    const newColors = [...formData.colors];
    newColors[colorIndex].sizes[sizeIndex].size = e.target.value;
    setFormData(prev => ({ ...prev, colors: newColors }));
  };

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { color: "", image: null, sizes: [{ size: "" }] }]
    }));
  };

  const removeColor = (colorIndex) => {
    const newColors = formData.colors.filter((_, index) => index !== colorIndex);
    setFormData(prev => ({ ...prev, colors: newColors }));
  };

  const addSize = (colorIndex) => {
    const newColors = [...formData.colors];
    newColors[colorIndex].sizes.push({ size: "" });
    setFormData(prev => ({ ...prev, colors: newColors }));
  };

  const removeSize = (colorIndex, sizeIndex) => {
    const newColors = [...formData.colors];
    newColors[colorIndex].sizes = newColors[colorIndex].sizes.filter(
      (_, index) => index !== sizeIndex
    );
    setFormData(prev => ({ ...prev, colors: newColors }));
  };

  const handleCheckedColor = () => {
    setAddColors(!addColors);
  };

  const addColorFromPreset = (colorName) => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { color: colorName, image: null, sizes: [{ size: "" }] }],
    }));
  };

  const addSizeFromPreset = (cIdx, sizeName) => {
    setFormData(prev => {
      const colors = [...prev.colors];
      const sizes = [...colors[cIdx].sizes];
      const lastIdx = sizes.length - 1;
      if (sizes[lastIdx].size === "") {
        sizes[lastIdx] = { ...sizes[lastIdx], size: sizeName };
      } else {
        sizes.push({ size: sizeName });
      }
      colors[cIdx] = { ...colors[cIdx], sizes };
      return { ...prev, colors };
    });
  };

  const addSizeGroupToColor = (cIdx, groupSizes) => {
    setFormData(prev => {
      const colors = [...prev.colors];
      const existingSizes = colors[cIdx].sizes.filter(s => s.size !== "");
      colors[cIdx] = {
        ...colors[cIdx],
        sizes: [...existingSizes, ...groupSizes.map(sz => ({ size: sz }))],
      };
      return { ...prev, colors };
    });
  };

  const addSingleSizeFromPreset = (sizeName) => {
    setFormData(prev => {
      const sizes = [...prev.singleProductSizes];
      const lastIdx = sizes.length - 1;
      if (sizes[lastIdx]?.size === "") {
        sizes[lastIdx] = { ...sizes[lastIdx], size: sizeName };
      } else {
        sizes.push({ size: sizeName });
      }
      return { ...prev, singleProductSizes: sizes };
    });
  };

  const handleSingleSizeChange = (index, e) => {
    const { value } = e.target;
    const singleProductSizes = [...formData.singleProductSizes];
    singleProductSizes[index] = {
      ...singleProductSizes[index],
      size: value
    };
    setFormData(prev => ({ ...prev, singleProductSizes }));
  };

  // Add new single product size
  const addSingleSize = () => {
    setFormData(prev => ({
      ...prev,
      singleProductSizes: [
        ...prev.singleProductSizes,
        { id: null, size: "" }
      ]
    }));
  };

  // Remove single product size
  const removeSingleSize = (index) => {
    const singleProductSizes = [...formData.singleProductSizes];
    singleProductSizes.splice(index, 1);
    setFormData(prev => ({ ...prev, singleProductSizes }));
  };

  // Bump handlers
  const handleBumpChange = (index, e) => {
    const { name, value } = e.target;
    const bumps = [...formData.bumps];
    bumps[index][name] = value;
    setFormData(prev => ({ ...prev, bumps }));
  };

  const addBump = () => {
    setFormData(prev => ({
      ...prev,
      bumps: [...(prev.bumps || []), { title: "", bump_price: "", image: null, description: "" }]
    }));
  };

  const removeBump = (index) => {
    const bumps = [...formData.bumps];
    bumps.splice(index, 1);
    setFormData(prev => ({ ...prev, bumps }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Product Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Slug*</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Category*</label>
              <select
                multiple
                value={formData.category_id || []}
                onChange={(e) => {
                  const values = Array.from(
                    e.target.selectedOptions,
                    option => option.value
                  );

                  setFormData(prev => ({
                    ...prev,
                    category_id: values
                  }));
                }}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <p className="text-sm text-gray-500 mt-1">
              Hold CTRL (Windows) / CMD (Mac) to select multiple categories
              </p>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">Price*</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="offer"
              checked={addOffer}
              onChange={() => setAddOffer(!addOffer)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="offer" className="ml-2 block text-gray-700">
              Add Discount Offer
            </label>
          </div>

          {addOffer && (
            <div>
              <label className="block text-gray-700 mb-1">Discount Price</label>
              <input
                type="number"
                name="discount_price"
                value={formData.discount_price}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 mb-1">Max Qty per Order</label>
            <input
              type="number"
              name="max_per_order"
              value={formData.max_per_order ?? ""}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Leave blank to use global limit"
              min="1"
              max="1000"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to use the global limit from Order Settings.</p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="free_delivery_enabled"
                checked={!!formData.free_delivery_enabled}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700 font-medium">Free Delivery on Bulk Purchase</span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">Customer gets free delivery when they buy a minimum quantity of this product.</p>
            {formData.free_delivery_enabled && (
              <div className="mt-3 ml-6">
                <label className="block text-gray-700 mb-1">Minimum Quantity for Free Delivery</label>
                <input
                  type="number"
                  name="free_delivery_min_qty"
                  value={formData.free_delivery_min_qty ?? ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 3"
                  min="1"
                  max="1000"
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="addColors"
                checked={addColors}
                onChange={handleCheckedColor}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="addColors" className="ml-2 block text-gray-700">
                Add Colors and Sizes
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showHomepage"
                checked={showHomepageFields}
                onChange={() => setShowHomepageFields(!showHomepageFields)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showHomepage" className="ml-2 block text-gray-700">
                Add Sales Letter
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showBulkDiscounts"
                checked={showBulkDiscounts}
                onChange={() => setShowBulkDiscounts(!showBulkDiscounts)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showBulkDiscounts" className="ml-2 block text-gray-700">
                Bulk Discounts
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showBumps"
                checked={showBumps}
                onChange={() => setShowBumps(!showBumps)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showBumps" className="ml-2 block text-gray-700">
                Add Bump Offers
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showSingleProductSizes"
                checked={showSingleProductSizes}
                onChange={() => setShowSingleProductSizes(!showSingleProductSizes)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="showSingleProductSizes" className="ml-2 block text-gray-700">
                Single Product Sizes
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showUpsell"
                checked={!!showUpsell}
                onChange={() => setShowUpsell && setShowUpsell(v => !v)}
                className="h-4 w-4 text-red-500 focus:ring-red-400 border-gray-300 rounded"
              />
              <label htmlFor="showUpsell" className="ml-2 block text-gray-700 font-medium text-red-600">
                🎁 Upsell Offer
              </label>
            </div>
          </div>

          {showUpsell && (
            <div className="border border-red-200 bg-red-50 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-bold text-red-700">Upsell Offer (Post-Order)</h4>
              <p className="text-xs text-red-500">অর্ডার সম্পন্ন হলে কাস্টমারকে এই আপসেল পেজে নিয়ে যাওয়া হবে।</p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Upsell Product</label>
                <select
                  value={formData.upsell_product_id || ""}
                  onChange={e => setFormData(p => ({ ...p, upsell_product_id: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <option value="">-- আপসেল পণ্য বেছে নিন --</option>
                  {upsellProducts.filter(u => u.is_active).map(u => (
                    <option key={u.id} value={String(u.id)}>
                      {u.name} (৳{Number(u.offer_price).toLocaleString()})
                    </option>
                  ))}
                </select>
                {upsellProducts.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">কোনো সক্রিয় আপসেল পণ্য নেই।</p>
                )}
              </div>
            </div>
          )}
          
          {showHomepageFields && (
            <div className="border p-4 rounded-lg space-y-4">
              <h3 className="text-lg font-medium">Add Content</h3>
              <div>
                <label className="block text-gray-700 mb-1">Headline</label>
                <input
                  type="text"
                  name="headline"
                  value={formData.homepage.headline}
                  onChange={handleHomepageChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter headline"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Paragraph</label>
                <textarea
                  name="paragraph"
                  value={formData.homepage.paragraph}
                  onChange={handleHomepageChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter paragraph"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Description</label>
                <QuillEditor
                    value={formData.homepage.description || ""}
                    onChange={handleQuillChange}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter description"
                    style={{ height: "200px" }}
                />
              </div>
            </div>
          )}

          {showBulkDiscounts && (
            <div className="border p-4 rounded-lg space-y-4">
              <h3 className="text-lg font-medium">Bulk Discounts</h3>
              {(formData.bulk_discounts || []).map((discount, index) => (
                <div key={index} className="border p-3 rounded space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1">Title*</label>
                      <input
                        type="text"
                        name="title"
                        value={discount.title}
                        onChange={(e) => handleBulkDiscountChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="e.g., Buy 3 Get 10% Off"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Offer Quantity*</label>
                      <input
                        type="number"
                        name="offer_quantity"
                        value={discount.offer_quantity}
                        onChange={(e) => handleBulkDiscountChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="e.g., 3"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Discount Percentage*</label>
                      <input
                        type="number"
                        name="discount_percentage"
                        value={discount.discount_percentage}
                        onChange={(e) => handleBulkDiscountChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="e.g., 10"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>
                  {(formData.bulk_discounts || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBulkDiscount(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Remove Discount
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addBulkDiscount}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Another Discount
              </button>
            </div>
          )}

          {!addColors && (
            <div className="border p-4 rounded-lg">
              <label className="block text-gray-700 mb-2">Product Images</label>
              
              {/* Existing Images Display */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {formData.images.map((image, index) => {
                  const imageUrlToShow = getImageUrl(image);
                  
                  return (
                    <div key={index} className="relative">
                      {imageUrlToShow ? (
                        <img 
                          src={imageUrlToShow}
                          alt={`Product ${index + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500">
                          Invalid Image
                        </div>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                        {image instanceof File ? 'New' : 'Existing'}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
              
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                accept="image/*"
              />
              <p className="text-sm text-gray-500 mt-1">
                Select new images to add to existing ones (WebP format, max 0.5MB)
              </p>
            </div>
          )}

          {addColors && (
            <div className="space-y-4">
              {/* Color preset chips */}
              {colorPresets.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-400 mb-1.5">Saved colors — click to add:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {colorPresets.map(cp => (
                      <button
                        key={cp.id}
                        type="button"
                        onClick={() => addColorFromPreset(cp.name)}
                        className="px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        + {cp.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.colors.map((color, colorIndex) => (
                <div key={colorIndex} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700">Color*</label>
                    <button
                      type="button"
                      onClick={() => removeColor(colorIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <ImCross className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={color.color}
                    onChange={(e) => handleColorChange(colorIndex, e)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />

                  <label className="block text-gray-700 mt-2 mb-1">Color Image*</label>
                  
                  {/* Color Image Display */}
                  {color.image && (
                    <div className="mb-2">
                      <img 
                        src={getImageUrl(color.image)}
                        alt={`Color ${color.color}`}
                        className="w-20 h-20 object-cover rounded border"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <input
                    type="file"
                    onChange={(e) => handleColorImageChange(colorIndex, e)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    accept="image/*"
                  />

                  <label className="block text-gray-700 mt-2 mb-1">Sizes</label>

                  {/* Size preset chips */}
                  {(sizePresets.length > 0 || sizeGroupPresets.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {sizePresets.map(sp => (
                        <button
                          key={sp.id}
                          type="button"
                          onClick={() => addSizeFromPreset(colorIndex, sp.name)}
                          className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          + {sp.name}
                        </button>
                      ))}
                      {sizeGroupPresets.map(sg => (
                        <button
                          key={sg.id}
                          type="button"
                          onClick={() => addSizeGroupToColor(colorIndex, sg.sizes)}
                          className="px-2.5 py-1 text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 rounded-full hover:bg-violet-100 transition-colors cursor-pointer"
                          title={`Apply: ${(sg.sizes || []).join(", ")}`}
                        >
                          ⚡ {sg.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {color.sizes.map((size, sizeIndex) => (
                    <div key={sizeIndex} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={size.size}
                        onChange={(e) => handleSizeChange(colorIndex, sizeIndex, e)}
                        className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter size"
                      />
                      <button
                        type="button"
                        onClick={() => removeSize(colorIndex, sizeIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <ImCross className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addSize(colorIndex)}
                    className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                  >
                    Add Size
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addColor}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Another Color
              </button>
            </div>
          )}

          {showBumps && (
            <div className="border p-4 rounded-lg space-y-4">
              <h3 className="text-lg font-medium">Bump Offers</h3>
              {(formData.bumps || []).map((bump, index) => (
                <div key={index} className="border p-3 rounded space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1">Bump Price*</label>
                      <input
                        type="text"
                        name="bump_price"
                        value={bump.bump_price || ""}
                        onChange={(e) => handleBumpChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="Bump price"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Title*</label>
                      <input
                        type="text"
                        name="title"
                        value={bump.title || ""}
                        onChange={(e) => handleBumpChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        placeholder="Bump offer title"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Image</label>
                      
                      {/* Bump Image Display */}
                      {bump.image && (
                        <div className="mb-2">
                          <img 
                            src={getImageUrl(bump.image)}
                            alt={`Bump ${bump.title}`}
                            className="w-20 h-20 object-cover rounded border"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <input
                        type="file"
                        onChange={(e) => handleBumpImageChange(index, e)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        accept="image/*"
                      />
                      {bump.image && !(bump.image instanceof File) && (
                        <p className="text-sm text-gray-500 mt-1">
                          Current image: {typeof bump.image === 'string' ? bump.image : 'Uploaded image'}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">Image will be compressed to WebP format (max 0.5MB)</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Description*</label>
                    <textarea
                      name="description"
                      value={bump.description || ""}
                      onChange={(e) => handleBumpChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Bump offer description"
                      rows="3"
                      required
                    />
                  </div>
                  {(formData.bumps || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBump(index)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Remove Bump
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addBump}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Another Bump
              </button>
            </div>
          )}

          {showSingleProductSizes && (
            <div className="border p-4 rounded-lg space-y-4">
              <h3 className="text-lg font-medium">Single Product Sizes</h3>

              {/* Size preset chips */}
              {(sizePresets.length > 0 || sizeGroupPresets.length > 0) && (
                <div className="flex flex-wrap gap-1.5">
                  {sizePresets.map(sp => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => addSingleSizeFromPreset(sp.name)}
                      className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      + {sp.name}
                    </button>
                  ))}
                  {sizeGroupPresets.map(sg => (
                    <button
                      key={sg.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => {
                          const existing = (prev.singleProductSizes || []).filter(s => s.size !== "");
                          return { ...prev, singleProductSizes: [...existing, ...(sg.sizes || []).map(sz => ({ size: sz }))] };
                        });
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 rounded-full hover:bg-violet-100 transition-colors cursor-pointer"
                      title={`Apply: ${(sg.sizes || []).join(", ")}`}
                    >
                      ⚡ {sg.name}
                    </button>
                  ))}
                </div>
              )}

              {(formData.singleProductSizes || []).map((size, index) => (
                <div key={index} className="border p-3 rounded space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      name="size"
                      value={size.size || ""}
                      onChange={(e) => handleSingleSizeChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Enter size (e.g., S, M, L)"
                    />
                    {(formData.singleProductSizes || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSingleSize(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <ImCross className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addSingleSize}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Another Size
              </button>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Update Product
            </button>
          </div>
    </form>
  );
};

export default UpdateProduct;