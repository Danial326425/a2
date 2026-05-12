"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdatePackage from "./UpdatePackage";
import { Package, Pencil, Trash2, Coins } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog, Badge,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;

const ViewPackage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({ name: "", coins: "", price: "", is_active: false });

  useEffect(() => {
    axios.get(`${apiUrl}/coinpackages`)
      .then(r => setPackages(r.data || []))
      .catch(() => setError("Failed to load packages"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/coinpackages/${deleteTarget}`);
      setPackages(prev => prev.filter(p => p.id !== deleteTarget));
    } catch { setError("Failed to delete package"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (pack) => {
    setEditingPackage(pack.id);
    setFormData({ name: pack.name, coins: pack.coins, price: pack.price, is_active: pack.is_active });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingPackage) return;
    try {
      await axios.put(`${apiUrl}/coinpackages/${editingPackage}`, formData);
      setPackages(prev => prev.map(p => p.id === editingPackage ? { ...p, ...formData } : p));
      setEditingPackage(null);
    } catch (err) { setError(err.response?.data?.message || "Failed to update package"); }
  };

  return (
    <div>
      <PageHeader
        title="Coin Packages"
        icon={Package}
        badge={packages.length}
        subtitle="Manage coin bundles users can purchase"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Package Name</TH>
            <TH>Coins</TH>
            <TH>Price</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : packages.length === 0 ? (
            <tbody><tr><td colSpan={5}>
              <EmptyState icon={Package} title="No coin packages" message="Add coin packages for users to purchase." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {packages.map(pkg => (
                  <motion.tr
                    key={pkg.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
                          <Package size={13} className="text-yellow-600" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{pkg.name}</span>
                      </div>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-1.5">
                        <Coins size={13} className="text-yellow-500" />
                        <span className="font-semibold text-gray-900">{pkg.coins}</span>
                      </div>
                    </TD>
                    <TD>
                      <span className="font-semibold text-gray-900">৳{pkg.price}</span>
                    </TD>
                    <TD>
                      <Badge variant={pkg.is_active ? "success" : "danger"}>
                        {pkg.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditClick(pkg)} title="Edit" />
                        <ActionBtn
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget(pkg.id)}
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
        title="Delete Package"
        message="Are you sure you want to delete this coin package?"
        confirmLabel="Delete"
      />

      {editingPackage && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start justify-end">
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="w-full max-w-lg bg-white min-h-screen shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
                    <Pencil size={15} className="text-yellow-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Edit Package</h2>
                </div>
                <button onClick={() => setEditingPackage(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdatePackage
                  formData={formData}
                  setFormData={setFormData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  onCancel={() => setEditingPackage(null)}
                  loading={loading}
                  setError={setError}
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

export default ViewPackage;
