"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { config } from '../../../config';
import { useReactToPrint } from 'react-to-print';
import InvoiceTemplate from './InvoiceTemplate';
import CustomerTable from './Component/CustomerTable';
import SearchAndFilter from './Component/SearchAndFilter';
import UpdateCustomer from './UpdateCustomer';
import SalesReportModal from './Component/SalesReportModal';
import CartProductDetails from './Component/CartProductDetails';
import { ShoppingBag, Plus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { PageHeader, ActionBtn } from '../../components/Dashboard/DashUI';

const apiUrl = config.apiUrl;
const steadfastApiUrl = 'https://portal.packzy.com/api/v1';
const pathaoApiUrl = 'https://courier-api-sandbox.pathao.com';

const ViewCustomer = () => {
  const [, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingApplication, setEditingApplication] = useState(null);
  const [formData, setFormData] = useState({
    order_id: '',
    customer_name: '',
    customer_address: '',
    phone_number: '',
    product_name: '',
    color: '',
    size: '',
    quantity: '',
    total: '',
    delivery_status: '',
    delivery_note: '',
  });
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [steadfast, setSteadfast] = useState({});
  const [orderStatuses, setOrderStatuses] = useState({});
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [printingInvoice, setPrintingInvoice] = useState(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showStatus, setShowStatus] = useState({});
  const [fraudDetails, setFraudDetails] = useState({});
  const itemsPerPage = 10;
  const invoiceRef = useRef();
  const statusCache = useRef({});

  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState(null);

  // Date range filter states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateFilterApplied, setDateFilterApplied] = useState(false);
  const [salesReport, setSalesReport] = useState(null);
  const [showSalesReport, setShowSalesReport] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const [pathaoData, setPathaoData] = useState({});
  const [fraudThreshold, setFraudThreshold] = useState(0);

  // Status options for dropdown
  const statusOptions = [
    'Confirmed',
    'Ready to Delivery',
    'Delivered',
    'Cancelled',
    'Return',
    'Hold',
    'Blocked',
    'In Transit',
    'Partial Delivered'
  ];

  // Tab configuration
  const tabs = [
    { key: 'all', label: 'All Orders' },
    { key: 'new_order', label: 'New Orders' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'ready_to_delivery', label: 'Ready to Delivery' },
    { key: 'ready_to_ship', label: 'Ready to Ship' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'return', label: 'Return' },
    { key: 'hold', label: 'Hold' },
    { key: 'blocked', label: 'Blocked' },
    { key: 'partial_delivered', label: 'Partial Delivered' },
    { key: 'approval_pending', label: 'Approval Pending' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'spam', label: '🚫 Spam' },
  ];

  // Bulk status update state
  const [bulkStatus, setBulkStatus] = useState('');


  const handleSubmitToPathao = async () => {
    if (selectedApplications.length === 0) {
      alert("কমপক্ষে একটি অর্ডার সিলেক্ট করুন");
      return;
    }


    try {
      const response = await axios.post(`${apiUrl}/pathao/submit-orders`, {
        orderIds: selectedApplications   // ← Laravel এ এটাই পাঠাবে
      });
      alert(response.data.message || `✔ Pathao-তে ${selectedApplications.length} টি অর্ডার সফলভাবে পাঠানো হয়েছে!`);
      setSelectedApplications([]);
      window.location.reload();
    } catch (error) {
      console.error(error?.response?.data);
      const errorMsg = error.response?.data?.message
        || "Pathao-তে অর্ডার সাবমিট করতে সমস্যা হয়েছে!";
      alert(errorMsg);
    }
  };

  const handleImageClick = (item) => {
    setSelectedProductDetails({ ...item });
    setShowProductModal(true);
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchError('Please enter a search term (name, phone or address)');
      return;
    }

    try {
      setLoading(true);
      setSearchError(null);

      const response = await axios.get(`${apiUrl}/customers/search/customerdata`, {
        params: {
          search: query
        }
      });

      if (response.data.customers && response.data.customers.length > 0) {
        const sorted = response.data.customers.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setApplications(sorted);
        setFilteredApplications(sorted);
        setTotalPages(Math.ceil(response.data.customers.length / itemsPerPage));
        setCurrentPage(1);
      } else {
        setSearchError('No customers found with this search criteria');
        setApplications([]);
        setFilteredApplications([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchError(err.response?.data?.message || 'Error performing search');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = async () => {
    setSearchQuery('');
    setSearchError(null);

    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/customers`);
      const raw = response.data.customers;
      const customers = (Array.isArray(raw) ? raw : (raw?.data ?? [])).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setApplications(customers);
      setFilteredApplications(customers);
      setTotalPages(Math.ceil(customers.length / itemsPerPage));
      setCurrentPage(1);
    } catch (err) {
      console.error("Error resetting search:", err);
      setError("Failed to reset search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`${apiUrl}/customerdelete/${id}`);
        setApplications(prev => prev.filter(app => app.id !== id));
        setSelectedApplications(prev => prev.filter(appId => appId !== id));
      } catch (err) {
        console.error("Error deleting order:", err?.response?.data?.message);
        setError("Failed to delete order. Please try again.");
      }
    }
  };

  // Filter applications by date range
  const filterByDateRange = (apps) => {
    if (!startDate || !endDate) return apps;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include entire end date

    return apps.filter(app => {
      const appDate = new Date(app.created_at);
      return appDate >= start && appDate <= end;
    });
  };

  // Generate sales report for the selected date range
  const generateSalesReport = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    const filteredOrders = filterByDateRange(applications);

    const report = {
      totalOrders: filteredOrders.length,
      totalSales: filteredOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0),
      deliveredOrders: filteredOrders.filter(order =>
        order.delivery_status?.toLowerCase() === 'delivered').length,
      cancelledOrders: filteredOrders.filter(order =>
        order.delivery_status?.toLowerCase() === 'cancelled').length,
      pendingOrders: filteredOrders.filter(order =>
        !order.delivery_status ||
        order.delivery_status.toLowerCase() === 'not confirm' ||
        order.delivery_status.toLowerCase() === 'confirmed').length,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      orders: filteredOrders
    };

    setSalesReport(report);
    setShowSalesReport(true);
  };

  // Apply date filter
  const applyDateFilter = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    setDateFilterApplied(true);
    const filtered = filterByDateRange(applications);
    setFilteredApplications(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [customersRes, steadfastRes, pathaoRes] = await Promise.all([
          axios.get(`${apiUrl}/customers`),
          axios.get(`${apiUrl}/steadfasts`),
          axios.get(`${apiUrl}/pathao/settings`),
        ]);

        setPathaoData(pathaoRes.data || {});
        setSteadfast(steadfastRes.data[0] || {});
        const raw = customersRes.data.customers;
        let customers = Array.isArray(raw) ? raw : (raw?.data ?? []);
        customers = customers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setApplications(customers);
        setFilteredApplications(customers);
        setTotalPages(Math.ceil(customers.length / itemsPerPage));
        setLoading(false);
      } catch (err) {
        console.error("API Error:", err.response ? err.response.data : err.message);
        setError("Failed to load data. Please try again.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterApplications = (apps) => {
    switch (activeTab) {
      case 'new_order':
        return apps.filter(app =>
          !app.delivery_status ||
          app.delivery_status === '' ||
          app.delivery_status.toLowerCase() === 'new order'
        );
      case 'confirmed':
        return apps.filter(app =>
          app.delivery_status &&
          app.delivery_status.toLowerCase() === 'confirmed'
        );
      case 'ready_to_delivery':
        return apps.filter(app =>
          app.delivery_status &&
          app.delivery_status.toLowerCase() === 'ready to delivery'
        );
      case 'ready_to_ship':
        return apps.filter(app =>
          app.delivery_status &&
          app.delivery_status.toLowerCase() === 'ready to ship'
        );
      case 'delivered':
        return apps.filter(app =>
          app.delivery_status &&
          app.delivery_status.toLowerCase() === 'delivered'
        );
      case 'cancelled':
        return apps.filter(app =>
          app.delivery_status &&
          app.delivery_status.toLowerCase() === 'cancelled'
        );
      case 'return':
        return apps.filter(app =>
          app.delivery_status &&
          app.delivery_status.toLowerCase() === 'return'
        );
      case 'hold':
        return apps.filter(app =>
          app.delivery_status &&
          app.delivery_status.toLowerCase() === 'hold'
        );
      case 'blocked':
        return apps.filter(app =>
          app.delivery_status &&
          app.delivery_status.toLowerCase() === 'blocked'
        );
      case 'in_transit':
        return apps.filter(app =>
          app.delivery_status &&
          app.delivery_status.toLowerCase() === 'in transit'
        );
      case 'partial_delivered':
        return apps.filter(app =>
          app.delivery_status &&
          app.delivery_status.toLowerCase() === 'partial delivered'
        );
      case 'approval_pending':
        return apps.filter(app =>
          app.delivery_status &&
          app.delivery_status.toLowerCase() === 'approval pending'
        );
      case 'spam':
        return apps.filter(app => !!app.is_spam || isSteadfastSpam(app.phone_number));
      default:
        return apps;
    }
  };

  // Reset date filter
  const resetDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setDateFilterApplied(false);
    setFilteredApplications(filterApplications(applications));
    setTotalPages(Math.ceil(applications.length / itemsPerPage));
    setCurrentPage(1);
  };

  // Filter applications and handle pagination
  useEffect(() => {
    if (applications.length === 0) return;

    const filtered = filterApplications(applications);
    setFilteredApplications(filtered);

    // Update total pages when filtered results change
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));

  }, [activeTab, applications, orderStatuses, fraudDetails, fraudThreshold]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPoints = async (customerId) => {
    try {
      const response = await axios.post(`${apiUrl}/customers/${customerId}/add-points`);

      alert(`পয়েন্ট যোগ করা হয়েছে! যোগ হয়েছে: ${response.data.points_added}, মোট পয়েন্ট: ${response.data.total_points}`);

      const customersRes = await axios.get(`${apiUrl}/customers`);
      const rawC = customersRes.data.customers;
      const customers = (Array.isArray(rawC) ? rawC : (rawC?.data ?? [])).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setApplications(customers);

    } catch (err) {
      console.error("Error adding points:", err);
      setError(err.response?.data?.message || "Failed to add points.");
    }
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredApplications.slice(startIndex, endIndex);
  };

  const handleSelectAllChange = () => {
    const currentItems = getCurrentPageItems();
    if (selectAll) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(currentItems.map(app => app.id));
    }
    setSelectAll(!selectAll);
  };

  // Bulk status update function
  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus) {
      alert("Please select a status first");
      return;
    }
    if (selectedApplications.length === 0) {
      alert("Please select at least one order to update status");
      return;
    }

    try {
      // Single request — backend processes sequentially so every CAPI
      // Purchase event fires without concurrent HTTP contention.
      const res = await axios.post(`${apiUrl}/customers/bulk-status`, {
        ids:    selectedApplications,
        status: bulkStatus,
      });

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          selectedApplications.includes(app.id)
            ? { ...app, delivery_status: bulkStatus }
            : app
        )
      );

      setSelectedApplications([]);
      setBulkStatus('');

      const { updated, errors } = res.data;
      if (errors?.length) {
        alert(`${updated} orders updated. ${errors.length} failed:\n${errors.join('\n')}`);
      } else {
        alert(`Successfully updated ${updated} orders to ${bulkStatus}`);
      }

    } catch (err) {
      console.error("Error updating bulk status:", err);
      setError("Failed to update status. Please try again.");
    }
  };

  const handleSubmitToSteadfast = async () => {
    if (selectedApplications.length === 0) {
      alert("অন্তত একটি অর্ডার সিলেক্ট করুন");
      return;
    }

    const selectedOrders = applications
      .filter(app => selectedApplications.includes(app.id))
      .map(order => ({
        invoice: order.order_id,
        recipient_name: order.customer_name,
        recipient_address: order.customer_address,
        recipient_phone: order.phone_number,
        cod_amount: Number(order.total),
        note: order.delivery_note,
      }));

    try {
      const response = await axios.post(
        `${steadfastApiUrl}/create_order/bulk-order`,
        selectedOrders,
        {
          headers: {
            'Api-Key': steadfast.apiKey,
            'Secret-Key': steadfast.secretKey,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      // consignment_id ডাটাবেজে আপডেট করা এবং status change to 'Ready to Ship'
      try {
        await Promise.all(
          response.data.data.map(async (orderResponse) => {
            await axios.put(`${apiUrl}/customersconsignmentupdate/${orderResponse.invoice}`, {
              consignment_id: orderResponse.consignment_id,
              delivery_status: 'Ready to Ship',
            });
          })
        );

        // লোকাল স্টেট আপডেট - অর্ডারগুলোকে 'Ready to Ship' এ আপডেট করুন
        const updatedApplications = applications.map(app => {
          if (selectedApplications.includes(app.id)) {
            return {
              ...app,
              delivery_status: 'Ready to Ship',
              consignment_id: response.data.data.find(d => d.invoice === app.order_id)?.consignment_id
            };
          }
          return app;
        });

        setApplications(updatedApplications);

        // সফলতার মেসেজ দেখানো
        alert(`সফলভাবে ${response.data.data.length}টি অর্ডার Steadfast-এ সাবমিট করা হয়েছে এবং Ready to Ship এ মুভ করা হয়েছে!`);

        // সিলেকশন ক্লিয়ার করুন
        setSelectedApplications([]);

      } catch (error) {
        console.error(error.response?.data?.message);
        alert("Consignment ID ডাটাবেজে আপডেট করতে সমস্যা হয়েছে।");
      }

    } catch (err) {
      console.error("স্ট্যাডফাস্টে সাবমিট করার সময় এরর:", err);
      let errorMessage = "অর্ডার সাবমিট করতে সমস্যা হয়েছে";
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "API Key বা Secret Key ভুল";
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      }
      alert(errorMessage);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'new order':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'ready to delivery':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready to ship':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'return':
        return 'bg-orange-100 text-orange-800';
      case 'hold':
        return 'bg-gray-100 text-gray-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      case 'in transit':
        return 'bg-indigo-100 text-indigo-800';
      case 'partial delivered':
        return 'bg-cyan-100 text-cyan-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch status for a single order with retry logic
  const fetchOrderStatus = async (invoice, retries = 3) => {
    try {
      const response = await axios.get(`${steadfastApiUrl}/status_by_invoice/${invoice}`, {
        headers: {
          'Api-Key': steadfast.apiKey,
          'Secret-Key': steadfast.secretKey,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      const status = response.data.delivery_status || 'New Order';
      // Update cache
      statusCache.current[invoice] = status;
      return status;
    } catch (err) {
      if (err.response?.status === 429 && retries > 0) {
        // Exponential backoff
        const delay = Math.pow(2, 4 - retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchOrderStatus(invoice, retries - 1);
      }
      console.error(`Error fetching status for invoice ${invoice}:`, err);
      return 'New Order';
    }
  };

  // Refresh all statuses for current page items
  const refreshAllStatuses = async () => {
    try {
      setRefreshLoading(true);
      const currentItems = getCurrentPageItems();
      const statusMap = {};

      for (const item of currentItems) {
        const rawStatus = await fetchOrderStatus(item.order_id);
        let mappedStatus;
        switch (rawStatus.toLowerCase()) {
          case 'in_review':
            mappedStatus = 'Ready to Ship';
            break;
          case 'pending':
            mappedStatus = 'In Transit';
            break;
          case 'delivered':
            mappedStatus = 'Delivered';
            break;
          case 'cancelled':
            mappedStatus = 'Return';
            break;
          case 'partial_delivered':
            mappedStatus = 'Partial Delivered';
            break;
          case 'delivered_approval_pending':
          case 'partial_delivered_approval_pending':
          case 'cancelled_approval_pending':
          case 'unknown_approval_pending':
          case 'unknown':
          case 'hold':
            mappedStatus = 'Approval Pending';
            break;
          default:
            mappedStatus = rawStatus;
        }

        statusMap[item.order_id] = mappedStatus;

        // Update database if status changed
        if (mappedStatus !== item.delivery_status) {
          try {
            await axios.put(`${apiUrl}/customersupdate/${item.id}`, {
              ...item,
              delivery_status: mappedStatus
            });
            
            // Update local applications state
            setApplications(prev => 
              prev.map(app => 
                app.id === item.id ? { ...app, delivery_status: mappedStatus } : app
              )
            );
          } catch (dbErr) {
            console.error(`Error updating status for order ${item.order_id}:`, dbErr);
          }
        }
      }

      setOrderStatuses(prev => ({ ...prev, ...statusMap }));
      setRefreshLoading(false);
    } catch (err) {
      console.error("Error refreshing statuses:", err);
      setError("Failed to refresh statuses. Please try again.");
      setRefreshLoading(false);
    }
  };

  const downloadDeliveredCSV = () => {
    const deliveredOrders = applications.filter(app =>
      app.delivery_status && app.delivery_status.toLowerCase() === 'delivered'
    );

    if (deliveredOrders.length === 0) {
      alert("No delivered orders found to download.");
      return;
    }

    // Define CSV headers
    const headers = ["Order ID", "Customer Name", "Phone", "Address", "Product", "Total", "Status", "Date"];

    // Create CSV rows
    const rows = deliveredOrders.map(order => [
      order.order_id,
      order.customer_name,
      order.phone_number,
      `"${order.customer_address.replace(/"/g, '""')}"`, // Quote and escape address
      order.product_name,
      order.total,
      order.delivery_status,
      new Date(order.created_at).toLocaleDateString()
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `delivered_orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheckboxChange = (id) => {
    setSelectedApplications(prev =>
      prev.includes(id)
        ? prev.filter(appId => appId !== id)
        : [...prev, id]
    );
  };

  const handleEditClick = (app) => {
    setEditingApplication(app.id);
    setFormData({
      order_id: app.order_id || '',
      customer_name: app.customer_name || '',
      customer_address: app.customer_address || '',
      phone_number: app.phone_number || '',
      product_name: app.product_name || '',
      color: app.color || '',
      size: app.size || '',
      quantity: app.quantity || '',
      total: app.total || '',
      delivery_status: app.delivery_status || '',
      delivery_note: app.delivery_note || '',
    });
  };

  // Fetch status for an order when clicked
  const fetchStatusOnClick = async (orderId) => {
    const order = applications.find(app => app.id === orderId);
    if (!order) return;

    try {
      setShowStatus(prev => ({ ...prev, [orderId]: 'loading' }));

      const status = await fetchOrderStatus(order.order_id);

      setOrderStatuses(prev => ({
        ...prev,
        [order.order_id]: status
      }));

      setShowStatus(prev => ({ ...prev, [orderId]: status }));
    } catch (err) {
      console.error("Error fetching status:", err);
      setShowStatus(prev => ({ ...prev, [orderId]: 'error' }));
    }
  };

  // Check fraud details for a customer
  const checkFraudDetails = async (phoneNumber) => {
    try {
      setFraudDetails(prev => ({ ...prev, [phoneNumber]: { loading: true } }));

      const response = await axios.get(`${steadfastApiUrl}/fraud_check/${phoneNumber}`, {
        headers: {
          'Api-Key': steadfast.apiKey,
          'Secret-Key': steadfast.secretKey,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      setFraudDetails(prev => ({
        ...prev,
        [phoneNumber]: {
          loading: false,
          data: response.data,
          isFraud: response.data.total_fraud_reports.length > 0
        }
      }));
    } catch (err) {
      console.error("Error checking fraud details:", err);
      setFraudDetails(prev => ({
        ...prev,
        [phoneNumber]: {
          loading: false,
          error: 'Error fetching fraud details'
        }
      }));
    }
  };

  // Filter applications by date range
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
  });

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const order = applications.find(app => app.id === orderId);
      if (!order) return;

      const response = await axios.put(`${apiUrl}/customersupdate/${orderId}`, {
        ...order,
        delivery_status: newStatus
      });

      // লোকাল স্টেট আপডেট করুন
      setApplications(prev =>
        prev.map(app =>
          app.id === orderId ? { ...app, delivery_status: newStatus } : app
        )
      );

      // অর্ডার স্ট্যাটাস স্টেট আপডেট করুন
      setOrderStatuses(prev => ({
        ...prev,
        [order.order_id]: newStatus
      }));

      alert(`Status updated to ${newStatus}`);

    } catch (err) {
      console.error("Error updating status:", err?.response?.data?.message);
      setError("Failed to update status. Please try again.");
    }
  };

  const handlePrintClick = (app) => {
    setPrintingInvoice(app);
    setShowPrintPreview(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiUrl}/customersupdate/${editingApplication}`, formData);
      setApplications(prev =>
        prev.map(app =>
          app.id === editingApplication ? { ...app, ...formData } : app
        )
      );
      setEditingApplication(null);
    } catch (err) {
      console.error("Error updating order:", err);
      setError(err.response?.data?.message || "Failed to update order.");
    }
  };

  const currentItems = getCurrentPageItems();
  const fraudRequestedRef = useRef(new Set());

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    axios
      .get(`${apiUrl}/order-settings`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then(res => {
        const v = parseFloat(res.data?.fraud_percentage_limit);
        setFraudThreshold(Number.isFinite(v) ? v : 0);
      })
      .catch(() => setFraudThreshold(0));
  }, []);

  useEffect(() => {
    if (!steadfast.apiKey || !steadfast.secretKey) return;
    const start = (currentPage - 1) * itemsPerPage;
    const visible = filteredApplications.slice(start, start + itemsPerPage);
    visible.forEach((app, idx) => {
      const phone = app.phone_number;
      if (!phone || fraudRequestedRef.current.has(phone)) return;
      fraudRequestedRef.current.add(phone);
      setTimeout(() => checkFraudDetails(phone), idx * 250);
    });
  }, [currentPage, filteredApplications, steadfast.apiKey, steadfast.secretKey]);

  useEffect(() => {
    if (!steadfast.apiKey || !steadfast.secretKey || !applications.length) return;
    const unique = [...new Set(applications.map(a => a.phone_number).filter(Boolean))];
    const pending = unique.filter(p => !fraudRequestedRef.current.has(p));
    pending.forEach((phone, idx) => {
      fraudRequestedRef.current.add(phone);
      setTimeout(() => checkFraudDetails(phone), 2500 + idx * 400);
    });
  }, [applications, steadfast.apiKey, steadfast.secretKey]);

  const isSteadfastSpam = (phone) => {
    if (!fraudThreshold || fraudThreshold <= 0) return false;
    const d = fraudDetails[phone]?.data;
    if (!d) return false;
    const delivered = Number(d.total_delivered ?? 0);
    const cancelled = Number(d.total_cancelled ?? 0);
    const finalized = delivered + cancelled;
    if (finalized < 3) return false;
    return (delivered / finalized) * 100 < fraudThreshold;
  };

  return (
    <div>
      <PageHeader
        title="Customer Orders"
        icon={ShoppingBag}
        badge={applications.length}
        subtitle="Manage orders, update statuses, and dispatch via courier"
        action={
          <ActionBtn variant="primary" icon={Plus} onClick={() => setSearchParams({ menu: "createOrder" })}>
            Create Order
          </ActionBtn>
        }
      />
      <CartProductDetails
        showProductModal={showProductModal}
        selectedProductDetails={selectedProductDetails}
        setShowProductModal={setShowProductModal}
      />
      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        onResetSearch={handleResetSearch}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onApplyDateFilter={applyDateFilter}
        onGenerateReport={generateSalesReport}
        onResetDateFilter={resetDateFilter}
        dateFilterApplied={dateFilterApplied}
        searchError={searchError}
      />

      <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">Customer Orders</h2>

          {/* Bulk Status Update Section - Right side of Customer Orders */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Bulk Status Update */}
            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Update Status:</span>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Status</option>
                {statusOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkStatusUpdate}
                disabled={!bulkStatus || selectedApplications.length === 0}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Update ({selectedApplications.length})
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={refreshAllStatuses}
                disabled={refreshLoading}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                {refreshLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Refresh
                  </>
                )}
              </button>
              <button
                onClick={handleSubmitToSteadfast}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center justify-center"
                disabled={selectedApplications.length === 0}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                </svg>
                Steadfast ({selectedApplications.length})
              </button>

              {/* Pathao Button — NEW */}
              <button
                onClick={handleSubmitToPathao}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                disabled={selectedApplications.length === 0}
              >
                Pathao ({selectedApplications.length})
              </button>
              <button
                onClick={downloadDeliveredCSV}
                className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-4 whitespace-nowrap">
            {tabs.map(tab => {
              const count = applications.filter(app => {
                if (tab.key === 'all') return true;
                if (tab.key === 'new_order') {
                  return !app.delivery_status ||
                    app.delivery_status === '' ||
                    app.delivery_status.toLowerCase() === 'new order';
                }
                if (tab.key === 'spam') {
                  return !!app.is_spam || isSteadfastSpam(app.phone_number);
                }
                const expectedStatus = tab.key.replace(/_/g, ' ').toLowerCase();
                const actualStatus = app.delivery_status ? app.delivery_status.toLowerCase() : '';
                return actualStatus === expectedStatus;
              }).length;

              const showPct = ['delivered', 'cancelled', 'return', 'partial_delivered'].includes(tab.key) && applications.length > 0;
              const pct = showPct ? Math.round((count / applications.length) * 100) : null;

              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setCurrentPage(1);
                  }}
                  className={`py-3 px-1 border-b-2 font-medium text-xs sm:text-sm ${activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  {tab.label} ({count}{pct !== null ? ` · ${pct}%` : ''})
                </button>
              );
            })}
          </nav>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-800 font-bold"
            >
              ×
            </button>
          </div>
        )}

        <CustomerTable
          applications={applications}
          currentItems={getCurrentPageItems()}
          selectedApplications={selectedApplications}
          handleCheckboxChange={handleCheckboxChange}
          handleEditClick={handleEditClick}
          handlePrintClick={handlePrintClick}
          handleDeleteClick={handleDelete}
          handleAddPoints={handleAddPoints}
          getStatusColor={getStatusColor}
          showStatus={showStatus}
          orderStatuses={orderStatuses}
          fetchStatusOnClick={fetchStatusOnClick}
          onUpdateStatus={handleStatusUpdate}
          statusOptions={statusOptions}
          totalPages={totalPages}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
          activeTab={activeTab}
          selectAll={selectAll}
          handleSelectAllChange={handleSelectAllChange}
          fraudDetails={fraudDetails}
          fraudThreshold={fraudThreshold}
          handleImageClick={handleImageClick}
        />
      </div>

      <SalesReportModal
        isOpen={showSalesReport}
        onClose={() => setShowSalesReport(false)}
        report={salesReport}
        onExportCSV={() => {
          const csvContent = [
            ['Order ID', 'Date', 'Customer', 'Phone', 'Amount', 'Status'],
            ...salesReport.orders.map(order => [
              order.order_id,
              new Date(order.created_at).toLocaleDateString(),
              order.customer_name,
              order.phone_number,
              order.total,
              order.delivery_status || 'New Order'
            ])
          ].map(e => e.join(",")).join("\n");

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", `sales_report_${salesReport.startDate}_to_${salesReport.endDate}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}
      />

      {editingApplication && (
        <UpdateCustomer
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          setEditingApplication={setEditingApplication}
        />
      )}

      {showPrintPreview && printingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold">Invoice Preview</h3>
              <div className="space-x-2">
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Print
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6">
              <InvoiceTemplate
                ref={invoiceRef}
                order={printingInvoice}
                logoUrl="/images/logo.png"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCustomer;