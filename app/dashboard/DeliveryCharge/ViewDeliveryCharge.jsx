"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateDeliveryCharge from "./UpdateDeliveryCharge";
import { Truck, Pencil, Trash2, Clock, MapPin } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TR, TD, TableSkeleton, EmptyState, ErrorBanner,
  ConfirmDialog, Badge,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;

const ViewDeliveryCharge = () => {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCharge, setEditingCharge] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    district_name: "", delivery_charge: "", estimated_days: "", delivery_note: "",
  });

  useEffect(() => {
    axios.get(`${apiUrl}/deliverycharges`)
      .then(r => setCharges(r.data || []))
      .catch(() => setError("Failed to load delivery charges"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/deliverychargedelete/${deleteTarget}`);
      setCharges(prev => prev.filter(c => c.id !== deleteTarget));
    } catch { setError("Failed to delete delivery charge"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (charge) => {
    setEditingCharge(charge.id);
    setFormData({
      district_name: charge.district_name,
      delivery_charge: charge.delivery_charge,
      estimated_days: charge.estimated_days,
      delivery_note: charge.delivery_note || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingCharge) return;
    try {
      await axios.put(`${apiUrl}/deliverychargesupdate/${editingCharge}`, formData);
      setCharges(prev => prev.map(c => c.id === editingCharge ? { ...c, ...formData } : c));
      setEditingCharge(null);
    } catch { setError("Failed to update delivery charge"); }
  };

  return (
    <div>
      <PageHeader
        title="Delivery Charges"
        icon={Truck}
        badge={charges.length}
        subtitle="Manage delivery fees and estimated times per district"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>District</TH>
            <TH>Charge</TH>
            <TH>Est. Days</TH>
            <TH>Note</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : charges.length === 0 ? (
            <TBody>
              <tr><td colSpan={5}>
                <EmptyState icon={Truck} title="No delivery charges" message="Add delivery charges for each district." />
              </td></tr>
            </TBody>
          ) : (
            <TBody>
              <AnimatePresence initial={false}>
                {charges.map(charge => (
                  <motion.tr
                    key={charge.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <MapPin size={13} className="text-indigo-600" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{charge.district_name}</span>
                      </div>
                    </TD>
                    <TD>
                      <span className="font-semibold text-gray-900">৳{charge.delivery_charge}</span>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock size={12} className="text-gray-400" />
                        {charge.estimated_days} days
                      </div>
                    </TD>
                    <TD>
                      {charge.delivery_note
                        ? <span className="text-sm text-gray-600">{charge.delivery_note}</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditClick(charge)} title="Edit" />
                        <ActionBtn
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget(charge.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        />
                      </div>
                    </TD>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TBody>
          )}
        </Table>
      </SectionCard>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Delivery Charge"
        message="Are you sure you want to delete this delivery charge?"
        confirmLabel="Delete"
      />

      {editingCharge && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start justify-end">
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="w-full max-w-lg bg-white min-h-screen shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Pencil size={15} className="text-indigo-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Edit Delivery Charge</h2>
                </div>
                <button onClick={() => setEditingCharge(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateDeliveryCharge
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  onCancel={() => setEditingCharge(null)}
                  loading={loading}
                  error={error}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewDeliveryCharge;
