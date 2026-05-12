"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Palette, Trash2, Image as ImageIcon } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;
const imageUrl = config.imageUrl;

const ViewColor = () => {
  const [colors, setColors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${apiUrl}/colors`),
      axios.get(`${apiUrl}/products`),
    ])
      .then(([cr, pr]) => {
        setColors(cr.data || []);
        setProducts(pr.data || []);
      })
      .catch(() => setError("Failed to load colors"))
      .finally(() => setLoading(false));
  }, []);

  const getProductName = (productId) => {
    const p = products.find(p => p.id === productId);
    return p ? p.name : "—";
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/colordelete/${deleteTarget}`);
      setColors(prev => prev.filter(c => c.id !== deleteTarget));
    } catch { setError("Failed to delete color"); }
    finally { setDeleteTarget(null); }
  };

  return (
    <div>
      <PageHeader
        title="Colors"
        icon={Palette}
        badge={colors.length}
        subtitle="Manage product color variants and their images"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Product</TH>
            <TH>Color</TH>
            <TH>Image</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : colors.length === 0 ? (
            <tbody><tr><td colSpan={4}>
              <EmptyState icon={Palette} title="No colors" message="Add color variants to your products." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {colors.map(color => (
                  <motion.tr
                    key={color.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <span className="text-sm font-medium text-gray-800">{getProductName(color.product_id)}</span>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full border border-gray-200 shrink-0"
                          style={{ backgroundColor: color.color?.toLowerCase() }}
                        />
                        <span className="text-sm text-gray-700">{color.color}</span>
                      </div>
                    </TD>
                    <TD>
                      {color.image ? (
                        <img
                          src={`${imageUrl}/${color.image}`}
                          alt={color.color}
                          className="h-10 w-10 rounded-lg object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                          <ImageIcon size={14} className="text-gray-300" />
                        </div>
                      )}
                    </TD>
                    <TD className="text-right">
                      <ActionBtn
                        variant="ghost" size="sm" icon={Trash2}
                        onClick={() => setDeleteTarget(color.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete"
                      />
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
        title="Delete Color"
        message="Are you sure you want to delete this color variant?"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default ViewColor;
