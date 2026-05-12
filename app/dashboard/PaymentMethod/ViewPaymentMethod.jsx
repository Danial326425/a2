"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdatePaymentMethod from "./UpdatePaymentMethod";
import { CreditCard, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

const ViewPaymentMethod = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    image: "", payment_method: "", payment_number: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    axios.get(`${apiUrl}/paymentmethod`)
      .then(r => setPayments(r.data || []))
      .catch(() => setError("Failed to load payment methods"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/paymentmethoddelete/${deleteTarget}`);
      setPayments(prev => prev.filter(p => p.id !== deleteTarget));
    } catch { setError("Failed to delete payment method"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (payment) => {
    setEditingPayment(payment.id);
    setFormData({
      payment_method: payment.payment_method,
      payment_number: payment.payment_number,
      image: payment.image,
    });
    setImagePreview(payment.image ? `${imageUrl}/${payment.image}` : null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData(prev => ({ ...prev, image: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingPayment) return;
    const data = new FormData();
    if (formData.image instanceof File) data.append("image", formData.image);
    data.append("payment_method", formData.payment_method);
    data.append("payment_number", formData.payment_number);
    data.append("_method", "PUT");
    try {
      const response = await axios.post(`${apiUrl}/paymentmethodupdate/${editingPayment}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPayments(prev => prev.map(p => p.id === editingPayment ? response.data : p));
      setEditingPayment(null);
    } catch { setError("Failed to update payment method"); }
  };

  return (
    <div>
      <PageHeader
        title="Payment Methods"
        icon={CreditCard}
        badge={payments.length}
        subtitle="Manage accepted payment methods and their details"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Method</TH>
            <TH>Number / Account</TH>
            <TH>QR / Logo</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={4} cols={4} />
          ) : payments.length === 0 ? (
            <tbody><tr><td colSpan={4}>
              <EmptyState icon={CreditCard} title="No payment methods" message="Add payment methods for your customers to use." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {payments.map(payment => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                          <CreditCard size={13} className="text-emerald-600" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{payment.payment_method}</span>
                      </div>
                    </TD>
                    <TD>
                      <span className="font-mono text-sm text-gray-700">{payment.payment_number}</span>
                    </TD>
                    <TD>
                      {payment.image ? (
                        <img
                          src={`${imageUrl}/${payment.image}`}
                          alt={payment.payment_method}
                          className="h-10 w-10 rounded-lg object-contain border border-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                          <ImageIcon size={14} className="text-gray-300" />
                        </div>
                      )}
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditClick(payment)} title="Edit" />
                        <ActionBtn
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget(payment.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        />
                      </div>
                    </TD>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          )}
        </Table>
      </SectionCard>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Payment Method"
        message="Are you sure you want to delete this payment method?"
        confirmLabel="Delete"
      />

      {editingPayment && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start justify-end">
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="w-full max-w-lg bg-white min-h-screen shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Pencil size={15} className="text-emerald-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Edit Payment Method</h2>
                </div>
                <button onClick={() => setEditingPayment(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdatePaymentMethod
                  formData={formData}
                  handleChange={handleChange}
                  handleImageChange={handleImageChange}
                  handleSubmit={handleSubmit}
                  onCancel={() => setEditingPayment(null)}
                  loading={loading}
                  error={error}
                  imagePreview={imagePreview}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewPaymentMethod;
