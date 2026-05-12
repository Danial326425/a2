"use client";

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateLead from "./UpdateLead";
import { OrderContext } from "../../context/OrderContext";
import { ProductContext } from "../../context/ProductsContext";
import { ClipboardList } from "lucide-react";
import { PageHeader, ErrorBanner } from "../../components/Dashboard/DashUI";

const ViewLead = () => {
  const {
    apiUrl,
    selectedColor,
    selectedSize,
    quantity
  } = useContext(OrderContext);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    phone_number: "",
    product_name: "",
    product_price: "",
    quantity: 1,
    color: "",
    size: "",
    status: "lead",
    customer_address: "",
    image: ""
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Filter states
  const [dateFilter, setDateFilter] = useState("all");
  const [customDate, setCustomDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("customer_name");

  // Action status states
  const [actionStatus, setActionStatus] = useState({
    loading: false,
    message: "",
    type: "" // success, error, warning
  });

  const { imageUrl } = useContext(OrderContext);
  const { products } = useContext(ProductContext);

  // Fetch leads with filters
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        let url = `${apiUrl}/leads?page=${currentPage}`;
        
        if (dateFilter !== "all") {
          url += `&date_filter=${dateFilter}`;
        }
        if (customDate) {
          url += `&custom_date=${customDate}`;
        }
        if (statusFilter !== "all") {
          url += `&status=${statusFilter}`;
        }
        if (searchTerm) {
          url += `&search=${searchTerm}&search_type=${searchType}`;
        }

        const response = await axios.get(url);
        setLeads(response.data.data);
        setCurrentPage(response.data.current_page);
        setLastPage(response.data.last_page);
        setPerPage(response.data.per_page);
        setTotal(response.data.total);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError("Failed to load leads.");
        setLoading(false);
      }
    };
    fetchLeads();
  }, [currentPage, dateFilter, customDate, statusFilter, searchTerm, searchType]);

  // Show action status message
  const showActionStatus = (message, type = "success") => {
    setActionStatus({
      loading: false,
      message,
      type
    });
    setTimeout(() => {
      setActionStatus({
        loading: false,
        message: "",
        type: ""
      });
    }, 3000);
  };

  // Find product by ID from products array
  const findProductById = (productId) => {
    if (!productId || !products || products.length === 0) return null;
    
    const id = typeof productId === 'string' ? parseInt(productId) : productId;
    
    const foundProduct = products.find(product => 
      product.id === id || 
      product.id?.toString() === productId?.toString()
    );
    
    return foundProduct;
  };

  // Get product image for lead
  const getProductImage = (lead) => {
    if (lead.product_id) {
      const product = findProductById(lead.product_id);
      if (product) {
        if (product.images && product.images.length > 0) {
          return `${imageUrl}/${product.images[0].image}`;
        }
        if (product.image) {
          return `${imageUrl}/${product.image}`;
        }
        if (product.colors && product.colors.length > 0 && product.colors[0].image) {
          return `${imageUrl}/${product.colors[0].image}`;
        }
      }
    }

    if (lead.image) {
      return `${imageUrl}/${lead.image}`;
    }
    
    if (lead.items && lead.items.length > 0) {
      const firstItem = lead.items[0];
      
      if (firstItem.product_image && firstItem.product_image.length > 0) {
        return `${imageUrl}/${firstItem.product_image[0].image}`;
      }
      
      if (firstItem.colors && firstItem.colors.length > 0 && firstItem.colors[0].image) {
        return `${imageUrl}/${firstItem.colors[0].image}`;
      }
    }
    
    return null;
  };

  // Get product details for modal
  const getProductDetails = (lead) => {
    const details = {
      name: lead.product_name || "N/A",
      price: lead.product_price || 0,
      quantity: lead.quantity || 1,
      color: lead.color || null,
      size: lead.size || null,
      images: [],
      productData: null
    };

    if (lead.product_id) {
      const product = findProductById(lead.product_id);
      if (product) {
        details.productData = product;
        details.name = product.name || details.name;
        
        if (product.images && product.images.length > 0) {
          details.images = product.images.map(img => `${imageUrl}/${img.image}`);
        } else if (product.image) {
          details.images = [`${imageUrl}/${product.image}`];
        }
        
        if (product.colors && product.colors.length > 0) {
          details.color = product.colors[0].color || details.color;
          if (details.images.length === 0) {
            details.images = product.colors
              .filter(color => color.image)
              .map(color => `${imageUrl}/${color.image}`);
          }
        }
        
        if (product.sizes && product.sizes.length > 0) {
          details.size = product.sizes[0].size || details.size;
        }
      }
    }

    if (details.images.length === 0 && lead.items && lead.items.length > 0) {
      const firstItem = lead.items[0];
      
      if (firstItem.product_image && firstItem.product_image.length > 0) {
        details.images = firstItem.product_image.map(img => `${imageUrl}/${img.image}`);
      }
      
      if (firstItem.colors && firstItem.colors.length > 0) {
        if (details.images.length === 0) {
          details.images = firstItem.colors
            .filter(color => color.image)
            .map(color => `${imageUrl}/${color.image}`);
        }
        details.color = firstItem.colors[0].color || details.color;
      }
      
      if (firstItem.sizes && firstItem.sizes.length > 0) {
        details.size = firstItem.sizes[0].size || details.size;
      }
    }

    return details;
  };

  const handleImageClick = (lead) => {
    const productDetails = getProductDetails(lead);
    setSelectedProductDetails({
      ...productDetails,
      customer_name: lead.customer_name,
      phone_number: lead.phone_number,
      customer_address: lead.customer_address,
      created_at: lead.created_at,
      product_id: lead.product_id
    });
    setShowProductModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        setActionStatus({ loading: true, message: "Deleting lead...", type: "warning" });
        await axios.delete(`${apiUrl}/leads/${id}`);
        const response = await axios.get(`${apiUrl}/leads?page=${currentPage}`);
        setLeads(response.data.data);
        showActionStatus("Lead deleted successfully!", "success");
      } catch (err) {
        console.error("Error deleting lead:", err);
        showActionStatus("Failed to delete lead.", "error");
      }
    }
  };

  const handleConvertToOrder = async (id) => {
    if (window.confirm("Are you sure you want to convert this lead to an order?")) {
      try {
        setActionStatus({ loading: true, message: "Converting lead to order...", type: "warning" });
        
        const convertResponse = await axios.post(`${apiUrl}/leads/${id}/convert`);
        
        if (convertResponse.data.success) {
          const response = await axios.get(`${apiUrl}/leads?page=${currentPage}`);
          setLeads(response.data.data);
          showActionStatus("Lead successfully converted to customer and order", "success");
        } else {
          throw new Error(convertResponse.data.message);
        }
        
      } catch (err) {
        console.error("Error converting lead:", err);
        showActionStatus("Failed to convert lead to order. " + 
          (err.response?.data?.message || err.message), "error"
        );
      }
    }
  };

  const handleEditClick = (lead) => {
    setEditingLead(lead.id);
    setFormData({
      customer_name: lead.customer_name,
      phone_number: lead.phone_number,
      product_name: lead.product_name || "",
      product_price: lead.product_price || "",
      quantity: lead.quantity || 1,
      color: lead.color || "",
      size: lead.size || "",
      status: lead.status,
      customer_address: lead.customer_address || "",
      image: lead.image || ""
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingLead) {
      showActionStatus("No lead selected for editing.", "error");
      return;
    }
    try {
      setActionStatus({ loading: true, message: "Updating lead...", type: "warning" });
      await axios.put(`${apiUrl}/leads/${editingLead}`, formData);
      const response = await axios.get(`${apiUrl}/leads?page=${currentPage}`);
      setLeads(response.data.data);
      setEditingLead(null);
      showActionStatus("Lead updated successfully", "success");
    } catch (err) {
      console.error("Error updating lead:", err);
      showActionStatus("Failed to update lead.", "error");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

 const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    
    // Date format: DD/MM/YYYY
    const formattedDate = date.toLocaleDateString('en-BD', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Time format: HH:MM AM/PM
    const formattedTime = date.toLocaleTimeString('en-BD', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    return `${formattedDate} ${formattedTime}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

  const getFilterSummary = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const todayCount = leads.filter(lead => 
      lead.created_at && lead.created_at.startsWith(today)
    ).length;
    
    const yesterdayCount = leads.filter(lead => 
      lead.created_at && lead.created_at.startsWith(yesterday)
    ).length;

    return { todayCount, yesterdayCount };
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchType("customer_name");
    setCurrentPage(1);
  };

  const { todayCount, yesterdayCount } = getFilterSummary();

  if (loading) {
    return (
      <div>
        <PageHeader title="Leads Management" icon={ClipboardList} subtitle="View and manage customer lead submissions" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Leads Management"
        icon={ClipboardList}
        badge={total}
        subtitle="View, filter, and manage customer lead submissions"
      />
      
      {/* Action Status Message */}
      {actionStatus.message && (
        <div className={`mb-4 p-3 rounded-lg border ${
          actionStatus.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' :
          actionStatus.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' :
          'bg-yellow-50 text-yellow-600 border-yellow-100'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {actionStatus.loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></div>
              )}
              <span>{actionStatus.message}</span>
            </div>
            <button
              onClick={() => setActionStatus({ loading: false, message: "", type: "" })}
              className="text-sm opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <ErrorBanner message={error} />

      {/* Search Section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Search Leads</h3>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Type
            </label>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="customer_name">Customer Name</option>
              <option value="phone_number">Phone Number</option>
              <option value="product_name">Product Name</option>
              <option value="order_id">Order ID</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Term
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Enter ${searchType.replace('_', ' ')}...`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600">
              <div>Total Results: <span className="font-bold">{total}</span></div>
              {searchTerm && (
                <div className="text-xs text-blue-600 mt-1">
                  Searching in: {searchType.replace('_', ' ')}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Filter Section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Filter Leads</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              তারিখ ফিল্টার
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">সব তারিখ</option>
              <option value="today">আজকে</option>
              <option value="yesterday">গতকাল</option>
              <option value="custom">কাস্টম তারিখ</option>
            </select>
          </div>

          {dateFilter === "custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                তারিখ সিলেক্ট করুন
              </label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              স্ট্যাটাস ফিল্টার
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">সব স্ট্যাটাস</option>
              <option value="lead">লিড</option>
              <option value="converted">কনভার্টেড</option>
            </select>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>আজকে:</span>
                <span className="font-bold">{todayCount}</span>
              </div>
              <div className="flex justify-between">
                <span>গতকাল:</span>
                <span className="font-bold">{yesterdayCount}</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span>মোট:</span>
                <span className="font-bold">{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {leads.length} of {total} leads (Page {currentPage} of {lastPage})
        </div>
        <div className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Details</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => {
              const product = lead.product_id ? findProductById(lead.product_id) : null;
              return (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getProductImage(lead) ? (
                      <img
                        src={getProductImage(lead)}
                        alt={lead.product_name || "Product"}
                        onClick={() => handleImageClick(lead)}
                        className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    <div 
                      className={`w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500 cursor-pointer hover:bg-gray-300 transition-colors ${
                        getProductImage(lead) ? 'hidden' : 'flex'
                      }`}
                      onClick={() => handleImageClick(lead)}
                      title="No image available"
                    >
                      No Image
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(lead.created_at)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div className="font-medium">{lead.customer_name}</div>
                    <div className="text-gray-500">{lead.phone_number}</div>
                    <div className="text-gray-500 text-xs mt-1 max-w-xs truncate" title={lead.customer_address}>
                      {lead.customer_address || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    <div>
                      <div className="font-medium text-gray-900">{lead.product_name || '-'}</div>
                      
                      {/* Product Details - Quantity, Color, Size */}
                      <div className="text-xs text-gray-600 mt-2 space-y-1">
                        {lead.quantity && (
                          <div className="flex items-center">
                            <span className="font-medium w-12">Qty:</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded ml-1">{lead.quantity}</span>
                          </div>
                        )}
                        
                        {lead.color && (
                          <div className="flex items-center">
                            <span className="font-medium w-12">Color:</span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded ml-1">{lead.color}</span>
                          </div>
                        )}
                        
                        {lead.size && (
                          <div className="flex items-center">
                            <span className="font-medium w-12">Size:</span>
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded ml-1">{lead.size}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.product_id || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.product_price ? `৳${lead.product_price}` : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      lead.status === 'converted' 
                        ? 'bg-green-100 text-green-800' 
                        : lead.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleEditClick(lead)}
                        className="text-blue-600 hover:text-blue-900 text-left flex items-center"
                        disabled={actionStatus.loading}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleConvertToOrder(lead.id)}
                        className="text-green-600 hover:text-green-900 text-left flex items-center"
                        disabled={lead.status === 'converted' || actionStatus.loading}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Convert
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-600 hover:text-red-900 text-left flex items-center"
                        disabled={actionStatus.loading}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {leads.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            {searchTerm ? 'No leads found matching your search criteria.' : 'No leads available.'}
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {showProductModal && selectedProductDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Product Details</h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              {/* Customer Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Customer Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Name: {selectedProductDetails.customer_name}</div>
                  <div>Phone: {selectedProductDetails.phone_number}</div>
                  <div className="col-span-2">
                    Address: {selectedProductDetails.customer_address || 'N/A'}
                  </div>
                  <div>Date: {formatDate(selectedProductDetails.created_at)}</div>
                  <div>Product ID: {selectedProductDetails.product_id || 'N/A'}</div>
                </div>
              </div>

              {/* Product Info */}
              <div className="mb-6">
                <h4 className="font-medium mb-4">Product Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-600">Product Name</label>
                    <div className="font-medium">{selectedProductDetails.name}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Price</label>
                    <div className="font-medium">৳{selectedProductDetails.price}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Quantity</label>
                    <div className="font-medium">{selectedProductDetails.quantity}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Total</label>
                    <div className="font-medium">৳{selectedProductDetails.price * selectedProductDetails.quantity}</div>
                  </div>
                  {selectedProductDetails.color && (
                    <div>
                      <label className="text-sm text-gray-600">Color</label>
                      <div className="font-medium">{selectedProductDetails.color}</div>
                    </div>
                  )}
                  {selectedProductDetails.size && (
                    <div>
                      <label className="text-sm text-gray-600">Size</label>
                      <div className="font-medium">{selectedProductDetails.size}</div>
                    </div>
                  )}
                </div>
                
                {/* Product Data Info */}
                {selectedProductDetails.productData && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <h5 className="font-medium text-green-800 mb-2">✓ Product Data Found in System</h5>
                    <div className="text-sm text-green-700">
                      <div>Product ID: {selectedProductDetails.productData.id}</div>
                      <div>Slug: {selectedProductDetails.productData.slug || 'N/A'}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Images */}
              <div>
                <h4 className="font-medium mb-4">Product Images ({selectedProductDetails.images.length})</h4>
                {selectedProductDetails.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedProductDetails.images.map((imageUrl, index) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Product Image ${index + 1}`}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            const noImageDiv = document.createElement('div');
                            noImageDiv.className = 'w-full h-48 flex items-center justify-center bg-gray-100 text-gray-500';
                            noImageDiv.textContent = 'No Image';
                            parent.appendChild(noImageDiv);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    No images available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {lastPage}
          </div>
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-l-md border ${
                currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, lastPage) }, (_, i) => {
              let pageNum;
              if (lastPage <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= lastPage - 2) {
                pageNum = lastPage - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 border-t border-b ${
                    currentPage === pageNum 
                      ? 'bg-blue-50 text-blue-600 border-blue-500' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === lastPage}
              className={`px-3 py-2 rounded-r-md border ${
                currentPage === lastPage 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {editingLead && (
        <div className="mt-8 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <UpdateLead
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            onCancel={() => setEditingLead(null)}
            loading={actionStatus.loading}
            error={error}
          />
        </div>
      )}
    </div>
  );
};

export default ViewLead;