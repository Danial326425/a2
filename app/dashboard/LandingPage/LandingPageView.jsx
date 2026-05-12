"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, 
  Button, 
  Modal, 
  Input, 
  Select, 
  Tag, 
  Space, 
  Card, 
  Row, 
  Col, 
  Statistic,
  Popconfirm,
  message,
  Tooltip,
  DatePicker,
  Switch,
  Form,
  Alert,
  Upload,
  Progress,
  Checkbox,
  Divider,
  Typography,
  Radio
} from 'antd';
import {
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  CopyOutlined,
  PlusOutlined,
  SearchOutlined,
  CloudUploadOutlined,
  ExportOutlined,
  ImportOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  LinkOutlined,
  FileTextOutlined,
  SettingOutlined,
  DownloadOutlined,
  InboxOutlined,
  FileOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileZipOutlined,
  FileUnknownOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { config } from '../../../config';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;
const { Dragger } = Upload;

const LandingPageView = () => {
  const router = useRouter();
  const apiUrl = config.apiUrl;
  
  // States
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [statistics, setStatistics] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    recent_pages: []
  });
  
  // Modal States
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState(null);
  const [exportOptions, setExportOptions] = useState({
    all: false,
    ids: []
  });
  
  const [newPageForm] = Form.useForm();
  const [editPageForm] = Form.useForm();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Load pages data
  const loadPages = async (params = {}) => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: params.current || pagination.current,
        per_page: params.pageSize || pagination.pageSize,
        search: searchText || '',
        status: statusFilter === 'all' ? '' : statusFilter,
        ...(dateRange[0] && { start_date: dateRange[0].format('YYYY-MM-DD') }),
        ...(dateRange[1] && { end_date: dateRange[1].format('YYYY-MM-DD') })
      });

      const response = await axios.get(`${apiUrl}/landing-pages?${queryParams}`);
      
      if (response.data.success) {
        setPages(response.data.data.data);
        setPagination({
          ...pagination,
          current: response.data.data.current_page,
          pageSize: response.data.data.per_page,
          total: response.data.data.total
        });
      }
    } catch (error) {
      message.error('Failed to load pages');
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await axios.get(`${apiUrl}/landing-pages/statistics`);
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  // Load products data
  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await axios.get(`${apiUrl}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      message.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadPages();
    loadStatistics();
    loadProducts();
  }, []);

  // Handle table change
  const handleTableChange = (newPagination, filters, sorter) => {
    loadPages({
      ...newPagination,
      ...filters,
      field: sorter.field,
      order: sorter.order
    });
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
    loadPages({ current: 1 });
  };

  // Handle status filter
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPagination({ ...pagination, current: 1 });
    loadPages({ current: 1 });
  };

  // Handle date range filter
  const handleDateRange = (dates) => {
    setDateRange(dates);
    setPagination({ ...pagination, current: 1 });
    loadPages({ current: 1 });
  };

  // Create new page
  const handleCreatePage = async (values) => {
    try {
      const response = await axios.post(`${apiUrl}/landing-pages`, {
        name: values.name,
        status: values.status || 'draft',
        product_id: values.product_id || null,
        checkout_display_mode: values.checkout_display_mode || 'scroll',
      });
      
      if (response.data.success) {
        message.success('Page created successfully');
        setCreateModalVisible(false);
        newPageForm.resetFields();
        loadPages();
        loadStatistics();
        
        if (values.auto_edit) {
          router.push(`/editor/${response.data.data.id}`);
        }
      }
    } catch (error) {
      message.error('Failed to create page');
      console.error(error.response ? error.response.data : error.message);
    }
  };

  // Open edit modal
  const handleOpenEditModal = (record) => {
    setEditingPage(record);
    editPageForm.setFieldsValue({
      name: record.name,
      slug: record.slug,
      status: record.status,
      product_id: record.product_id,
      checkout_display_mode: record.checkout_display_mode || 'scroll',
    });
    setEditModalVisible(true);
  };

  // Update page
  const handleUpdatePage = async (values) => {
    try {
      const response = await axios.put(`${apiUrl}/landing-pages/${editingPage.id}`, {
        name: values.name,
        slug: values.slug,
        status: values.status,
        product_id: values.product_id || null,
        checkout_display_mode: values.checkout_display_mode || 'scroll',
      });
      
      if (response.data.success) {
        message.success('Page updated successfully');
        setEditModalVisible(false);
        setEditingPage(null);
        editPageForm.resetFields();
        loadPages();
        loadStatistics();
      }
    } catch (error) {
      message.error('Failed to update page');
      console.error(error.response ? error.response.data : error.message);
    }
  };

  // Edit in editor
  const handleEdit = (id) => {
    router.push(`/editor/${id}`);
  };

  // View page
  const handleView = async (id, slug) => {
    try {
      const response = await axios.get(`${apiUrl}/landing-pages/slug/${slug}`);
      if (response.data.success) {
        setPreviewContent(response.data.data);
        setPreviewModalVisible(true);
      }
    } catch (error) {
      Modal.info({
        title: 'Page Not Published',
        content: 'This page is not published yet. Please publish it first to view.',
        okText: 'OK'
      });
    }
  };

  // Delete page
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${apiUrl}/landing-pages/${id}`);
      if (response.data.success) {
        message.success('Page deleted successfully');
        loadPages();
        loadStatistics();
      }
    } catch (error) {
      message.error('Failed to delete page');
      console.error('Error deleting page:', error);
    }
  };

  // Duplicate page
  const handleDuplicate = async (id) => {
    try {
      const response = await axios.post(`${apiUrl}/landing-pages/${id}/duplicate`);
      if (response.data.success) {
        message.success('Page duplicated successfully');
        loadPages();
        loadStatistics();
      }
    } catch (error) {
      message.error('Failed to duplicate page');
      console.error('Error duplicating page:', error);
    }
  };

  // Toggle status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const endpoint = currentStatus === 'published' 
        ? `${apiUrl}/landing-pages/${id}/unpublish`
        : `${apiUrl}/landing-pages/${id}/publish`;
      
      const response = await axios.post(endpoint);
      
      if (response.data.success) {
        message.success(`Page ${currentStatus === 'published' ? 'unpublished' : 'published'} successfully`);
        loadPages();
        loadStatistics();
      }
    } catch (error) {
      message.error('Failed to update page status');
      console.error('Error updating status:', error);
    }
  };

  // Bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedRows.length === 0) {
      message.warning('Please select an action and pages');
      return;
    }

    try {
      if (bulkAction === 'delete') {
        Modal.confirm({
          title: 'Confirm Bulk Delete',
          content: `Are you sure you want to delete ${selectedRows.length} page(s)? This action cannot be undone.`,
          okText: 'Delete',
          okType: 'danger',
          cancelText: 'Cancel',
          onOk: async () => {
            const response = await axios.post(`${apiUrl}/landing-pages/bulk-delete`, {
              ids: selectedRows.map(row => row.id)
            });
            
            if (response.data.success) {
              message.success(`${response.data.data.deleted_count} pages deleted successfully`);
              setSelectedRows([]);
              setBulkAction('');
              loadPages();
              loadStatistics();
            }
          }
        });
      } else if (bulkAction === 'publish' || bulkAction === 'draft') {
        const response = await axios.post(`${apiUrl}/landing-pages/bulk-update-status`, {
          ids: selectedRows.map(row => row.id),
          status: bulkAction
        });
        
        if (response.data.success) {
          message.success(`${response.data.data.updated_count} pages updated successfully`);
          setSelectedRows([]);
          setBulkAction('');
          loadPages();
          loadStatistics();
        }
      } else if (bulkAction === 'export') {
        handleExport(selectedRows.map(row => row.id));
      }
    } catch (error) {
      message.error('Failed to perform bulk action');
      console.error('Bulk action error:', error);
    }
  };

  // Export pages
  const handleExport = async (ids = null) => {
    try {
      setExportLoading(true);
      
      const payload = ids ? { ids } : (exportOptions.all ? { all: true } : {});
      
      const response = await axios.post(`${apiUrl}/landing-pages/export`, payload, {
        responseType: 'blob'
      });
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = `landing-pages-export-${moment().format('YYYY-MM-DD-HHmmss')}.json`;
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      message.success(`Export completed: ${filename}`);
      setExportModalVisible(false);
      
    } catch (error) {
      message.error('Failed to export pages');
      console.error('Export error:', error);
    } finally {
      setExportLoading(false);
    }
  };

  // Import pages
  const handleImport = async (file) => {
    try {
      setImportLoading(true);
      setImportProgress(0);
      setImportResult(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate progress
      const interval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
      
      const response = await axios.post(`${apiUrl}/landing-pages/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setImportProgress(percent);
        }
      });
      
      clearInterval(interval);
      setImportProgress(100);
      
      if (response.data.success) {
        setImportResult({
          success: true,
          ...response.data.data
        });
        
        message.success(response.data.message);
        
        // Reload pages after successful import
        setTimeout(() => {
          loadPages();
          loadStatistics();
        }, 1000);
      }
    } catch (error) {
      setImportProgress(0);
      setImportResult({
        success: false,
        error: error.response?.data?.message || error.message
      });
      message.error('Import failed: ' + (error.response?.data?.message || error.message));
      console.error('Import error:', error);
    } finally {
      setImportLoading(false);
    }
  };

  // Get file icon based on extension
  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch(ext) {
      case 'jpg': case 'jpeg': case 'png': case 'gif': case 'svg': case 'webp':
        return <FileImageOutlined style={{ color: '#52c41a' }} />;
      case 'pdf':
        return <FilePdfOutlined style={{ color: '#f5222d' }} />;
      case 'xls': case 'xlsx':
        return <FileExcelOutlined style={{ color: '#52c41a' }} />;
      case 'zip': case 'rar': case '7z':
        return <FileZipOutlined style={{ color: '#faad14' }} />;
      default:
        return <FileUnknownOutlined />;
    }
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: 'Page Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (text, record) => (
        <Space>
          <FileTextOutlined />
          <span style={{ fontWeight: 500 }}>{text}</span>
          {record.is_template && (
            <Tag color="blue" size="small">Template</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Slug/URL',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug) => (
        <Space>
          <LinkOutlined />
          <a 
            href={`/offer/${slug}`} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {slug}
          </a>
        </Space>
      )
    },
    {
      title: 'Product',
      dataIndex: ['product', 'name'],
      key: 'product',
      render: (productName) => productName || '-'
    },
    {
      title: 'Checkout',
      dataIndex: 'checkout_display_mode',
      key: 'checkout_display_mode',
      width: 100,
      render: (mode) => (
        <Tag color={mode === 'popup' ? 'purple' : 'cyan'}>
          {mode === 'popup' ? '⬜ Popup' : '↓ Scroll'}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Published', value: 'published' },
        { text: 'Draft', value: 'draft' }
      ],
      render: (status) => (
        <Tag 
          color={status === 'published' ? 'success' : 'default'}
          icon={status === 'published' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
        >
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Created By',
      dataIndex: ['creator', 'name'],
      key: 'creator',
      render: (creator) => (
        <Space>
          <UserOutlined />
          <span>{creator || 'System'}</span>
        </Space>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      sorter: true,
      render: (date) => (
        <Space>
          <CalendarOutlined />
          <span>{moment(date).format('YYYY-MM-DD HH:mm')}</span>
        </Space>
      )
    },
    {
      title: 'Published At',
      dataIndex: 'published_at',
      key: 'published_at',
      width: 180,
      sorter: true,
      render: (date) => date ? (
        <Space>
          <CalendarOutlined />
          <span>{moment(date).format('YYYY-MM-DD HH:mm')}</span>
        </Space>
      ) : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Details">
            <Button
              type="default"
              icon={<SettingOutlined />}
              size="small"
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>
          
          <Tooltip title="Open in Editor">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record.id)}
            />
          </Tooltip>
          
          <Tooltip title="Preview">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleView(record.id, record.slug)}
            />
          </Tooltip>
          
          <Tooltip title="Duplicate">
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={() => handleDuplicate(record.id)}
            />
          </Tooltip>
          
          <Tooltip title={record.status === 'published' ? 'Unpublish' : 'Publish'}>
            <Button
              type={record.status === 'published' ? 'default' : 'primary'}
              icon={record.status === 'published' ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
              size="small"
              onClick={() => handleToggleStatus(record.id, record.status)}
            />
          </Tooltip>
          
          <Popconfirm
            title="Delete this page?"
            description="Are you sure you want to delete this page? This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okType="danger"
          >
            <Tooltip title="Delete">
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Row selection
  const rowSelection = {
    selectedRowKeys: selectedRows.map(row => row.id),
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: false
    })
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Pages"
              value={statistics.total}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Published"
              value={statistics.published}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Drafts"
              value={statistics.drafts}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Last Updated"
              value={statistics.recent_pages?.[0]?.updated_at ? 
                moment(statistics.recent_pages[0].updated_at).fromNow() : 'N/A'}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Action Bar */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                Create New Page
              </Button>
              
              <Button
                icon={<ExportOutlined />}
                onClick={() => setExportModalVisible(true)}
              >
                Export
              </Button>
              
              <Button
                icon={<ImportOutlined />}
                onClick={() => {
                  setImportResult(null);
                  setImportModalVisible(true);
                }}
              >
                Import
              </Button>
            </Space>
          </Col>
          
          <Col>
            <Space>
              <Search
                placeholder="Search pages..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
              />
              
              <Select
                placeholder="Status"
                style={{ width: 120 }}
                value={statusFilter}
                onChange={handleStatusFilter}
              >
                <Option value="all">All Status</Option>
                <Option value="published">Published</Option>
                <Option value="draft">Draft</Option>
              </Select>
              
              <RangePicker
                onChange={handleDateRange}
                style={{ width: 250 }}
              />
            </Space>
          </Col>
        </Row>
        
        {/* Bulk Actions */}
        {selectedRows.length > 0 && (
          <Alert
            message={
              <Space>
                <span>{selectedRows.length} page(s) selected</span>
                <Select
                  placeholder="Select action"
                  style={{ width: 140 }}
                  value={bulkAction}
                  onChange={setBulkAction}
                >
                  <Option value="publish">Publish</Option>
                  <Option value="draft">Move to Draft</Option>
                  <Option value="export">Export Selected</Option>
                  <Option value="delete">Delete</Option>
                </Select>
                <Button
                  type="primary"
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                >
                  Apply
                </Button>
                <Button onClick={() => setSelectedRows([])}>
                  Clear
                </Button>
              </Space>
            }
            type="info"
            showIcon
            style={{ marginTop: '16px' }}
          />
        )}
      </Card>

      {/* Pages Table */}
      <Card title="All Landing Pages">
        <Table
          columns={columns}
          dataSource={pages}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowSelection={rowSelection}
          scroll={{ x: 1400 }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ margin: 0 }}>
                <p><strong>Components:</strong> {record.components?.length || 0}</p>
                <p><strong>Assets:</strong> {record.assets?.length || 0}</p>
                <p><strong>HTML Size:</strong> {(record.html?.length || 0)} characters</p>
                <p><strong>CSS Size:</strong> {(record.css?.length || 0)} characters</p>
              </div>
            ),
            rowExpandable: (record) => record.components || record.assets
          }}
        />
      </Card>

      {/* Create Page Modal */}
      <Modal
        title="Create New Landing Page"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          newPageForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={newPageForm}
          layout="vertical"
          onFinish={handleCreatePage}
        >
          <Form.Item
            name="name"
            label="Page Name"
            rules={[{ required: true, message: 'Please enter page name' }]}
          >
            <Input placeholder="Enter page name" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Initial Status"
            initialValue="draft"
          >
            <Select>
              <Option value="draft">Draft</Option>
              <Option value="published">Published</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="product_id"
            label="Product"
          >
            <Select
              placeholder="Select a product"
              loading={loadingProducts}
              showSearch
              allowClear
            >
              {products.map(product => (
                <Option key={product.id} value={product.id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="checkout_display_mode"
            label="Checkout Display Mode"
            initialValue="scroll"
          >
            <Radio.Group>
              <Radio value="scroll">
                <span style={{ fontWeight: 500 }}>Scroll</span>
                <span style={{ color: '#8c8c8c', fontSize: 12, marginLeft: 6 }}>
                  — Checkout form shows below the page
                </span>
              </Radio>
              <Radio value="popup" style={{ marginTop: 6, display: 'block' }}>
                <span style={{ fontWeight: 500 }}>Popup / Modal</span>
                <span style={{ color: '#8c8c8c', fontSize: 12, marginLeft: 6 }}>
                  — Checkout form opens in a modal
                </span>
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="auto_edit"
            label=" "
            valuePropName="checked"
            initialValue={true}
          >
            <Switch
              checkedChildren="Open in editor"
              unCheckedChildren="Create only"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Page
              </Button>
              <Button onClick={() => setCreateModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Page Modal */}
      <Modal
        title="Edit Page Details"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingPage(null);
          editPageForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={editPageForm}
          layout="vertical"
          onFinish={handleUpdatePage}
        >
          <Form.Item
            name="name"
            label="Page Name"
            rules={[{ required: true, message: 'Please enter page name' }]}
          >
            <Input placeholder="Enter page name" />
          </Form.Item>
          
          <Form.Item
            name="slug"
            label="Slug/URL"
            rules={[
              { required: true, message: 'Please enter page slug' },
              { pattern: /^[a-z0-9-]+$/, message: 'Slug can only contain lowercase letters, numbers, and hyphens' }
            ]}
          >
            <Input placeholder="enter-page-slug" addonBefore="/offer/" />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="draft">Draft</Option>
              <Option value="published">Published</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="product_id"
            label="Product"
          >
            <Select
              placeholder="Select a product"
              loading={loadingProducts}
              showSearch
              allowClear
            >
              {products.map(product => (
                <Option key={product.id} value={product.id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="checkout_display_mode"
            label="Checkout Display Mode"
          >
            <Radio.Group>
              <Radio value="scroll">
                <span style={{ fontWeight: 500 }}>Scroll</span>
                <span style={{ color: '#8c8c8c', fontSize: 12, marginLeft: 6 }}>
                  — Checkout form shows below the page
                </span>
              </Radio>
              <Radio value="popup" style={{ marginTop: 6, display: 'block' }}>
                <span style={{ fontWeight: 500 }}>Popup / Modal</span>
                <span style={{ color: '#8c8c8c', fontSize: 12, marginLeft: 6 }}>
                  — Checkout form opens in a modal
                </span>
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Update Page
              </Button>
              <Button onClick={() => {
                setEditModalVisible(false);
                setEditingPage(null);
                editPageForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Page Preview"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        width="90%"
        style={{ top: 20 }}
        footer={null}
      >
        <div style={{ height: '70vh', overflow: 'auto', background: '#fff', padding: '20px' }}>
          {previewContent && (
            <>
              <style>{previewContent.css}</style>
              <div dangerouslySetInnerHTML={{ __html: previewContent.html }} />
            </>
          )}
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        title="Export Landing Pages"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setExportModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="export" 
            type="primary" 
            icon={<DownloadOutlined />}
            loading={exportLoading}
            onClick={() => handleExport()}
          >
            Export
          </Button>
        ]}
      >
        <div style={{ padding: '20px 0' }}>
          <Alert
            message="Export Options"
            description="Choose what to export. All pages will be exported with their content, assets, and settings."
            type="info"
            showIcon
            style={{ marginBottom: '20px' }}
          />
          
          <Form layout="vertical">
            <Form.Item label="Export Type">
              <Radio.Group 
                value={exportOptions.all ? 'all' : 'selected'}
                onChange={(e) => {
                  setExportOptions({
                    ...exportOptions,
                    all: e.target.value === 'all'
                  });
                }}
              >
                <Radio value="selected">Selected Pages ({selectedRows.length})</Radio>
                <Radio value="all">All Pages</Radio>
              </Radio.Group>
            </Form.Item>
            
            {!exportOptions.all && selectedRows.length === 0 && (
              <Alert
                message="No pages selected"
                description="Please select pages from the table or choose 'All Pages' option."
                type="warning"
                showIcon
              />
            )}
            
            {!exportOptions.all && selectedRows.length > 0 && (
              <div style={{ maxHeight: '200px', overflow: 'auto', border: '1px solid #f0f0f0', padding: '10px', borderRadius: '4px' }}>
                {selectedRows.map(row => (
                  <div key={row.id} style={{ padding: '4px 0' }}>
                    <Checkbox checked disabled>
                      <Space>
                        {getFileIcon(row.name)}
                        <span>{row.name}</span>
                        <Tag color={row.status === 'published' ? 'success' : 'default'} size="small">
                          {row.status}
                        </Tag>
                      </Space>
                    </Checkbox>
                  </div>
                ))}
              </div>
            )}
          </Form>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        title="Import Landing Pages"
        open={importModalVisible}
        onCancel={() => {
          setImportModalVisible(false);
          setImportResult(null);
          setImportProgress(0);
        }}
        footer={[
          <Button 
            key="close" 
            onClick={() => {
              setImportModalVisible(false);
              setImportResult(null);
              setImportProgress(0);
            }}
          >
            Close
          </Button>
        ]}
        width={700}
      >
        <div style={{ padding: '20px 0' }}>
          {!importResult ? (
            <>
              <Dragger
                name="file"
                multiple={false}
                accept=".json"
                showUploadList={false}
                customRequest={({ file, onSuccess, onError }) => {
                  handleImport(file)
                    .then(() => onSuccess())
                    .catch(err => onError(err));
                }}
                disabled={importLoading}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                  Support for JSON files exported from this system. Maximum file size: 100MB.
                </p>
              </Dragger>
              
              {importLoading && (
                <div style={{ marginTop: '20px' }}>
                  <Progress percent={importProgress} status="active" />
                  <Text type="secondary">Importing pages, please wait...</Text>
                </div>
              )}
              
              <Alert
                message="Import Guidelines"
                description={
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Files must be in JSON format exported from this system</li>
                    <li>All pages will be imported as drafts for safety</li>
                    <li>Duplicate slugs will be automatically handled with unique suffixes</li>
                    <li>Associated assets will be imported with the pages</li>
                  </ul>
                }
                type="info"
                showIcon
                style={{ marginTop: '20px' }}
              />
            </>
          ) : (
            <div>
              {importResult.success ? (
                <>
                  <Alert
                    message="Import Successful"
                    description={`Successfully imported ${importResult.imported_count} out of ${importResult.total_in_file} pages.`}
                    type="success"
                    showIcon
                    style={{ marginBottom: '20px' }}
                  />
                  
                  <Card size="small" title="Import Summary">
                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Statistic 
                          title="Imported" 
                          value={importResult.imported_count} 
                          suffix={`/ ${importResult.total_in_file}`}
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic 
                          title="Failed" 
                          value={importResult.failed_imports?.length || 0} 
                          valueStyle={{ color: importResult.failed_imports?.length ? '#f5222d' : '#52c41a' }}
                        />
                      </Col>
                    </Row>
                  </Card>
                  
                  {importResult.failed_imports?.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <Text strong type="danger">Failed Imports:</Text>
                      <div style={{ maxHeight: '150px', overflow: 'auto', marginTop: '10px' }}>
                        {importResult.failed_imports.map((failed, index) => (
                          <Alert
                            key={index}
                            message={failed.name}
                            description={failed.error}
                            type="error"
                            showIcon
                            style={{ marginBottom: '8px' }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {importResult.imported_pages?.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                      <Text strong>Imported Pages:</Text>
                      <div style={{ maxHeight: '150px', overflow: 'auto', marginTop: '10px' }}>
                        {importResult.imported_pages.map(page => (
                          <div key={page.id} style={{ padding: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
                            <Space>
                              <FileTextOutlined />
                              <span>{page.name}</span>
                            </Space>
                            <Tag color="blue">{page.slug}</Tag>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Alert
                  message="Import Failed"
                  description={importResult.error || 'An error occurred during import'}
                  type="error"
                  showIcon
                />
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default LandingPageView;