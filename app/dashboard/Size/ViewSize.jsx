"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import { Ruler, Trash2 } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;

const ViewSize = () => {
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${apiUrl}/sizes`),
      axios.get(`${apiUrl}/colors`),
      axios.get(`${apiUrl}/products`),
    ])
      .then(([sr, cr, pr]) => {
        setSizes(sr.data || []);
        setColors(cr.data || []);
        setProducts(pr.data || []);
      })
      .catch(() => setError("Failed to load sizes"))
      .finally(() => setLoading(false));
  }, []);

  const getColorName = (colorId) => {
    return colors.find(c => c.id === colorId)?.color || "—";
  };

  const getProductName = (colorId) => {
    const color = colors.find(c => c.id === colorId);
    return products.find(p => p.id === color?.product_id)?.name || "—";
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/sizedelete/${deleteTarget}`);
      setSizes(prev => prev.filter(s => s.id !== deleteTarget));
    } catch { setError("Failed to delete size"); }
    finally { setDeleteTarget(null); }
  };

  return (
    <div>
      <PageHeader
        title="Sizes"
        icon={Ruler}
        badge={sizes.length}
        subtitle="Manage size variants for product colors"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Product</TH>
            <TH>Color</TH>
            <TH>Size</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : sizes.length === 0 ? (
            <tbody><tr><td colSpan={4}>
              <EmptyState icon={Ruler} title="No sizes" message="Add size variants to your product colors." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {sizes.map(size => (
                  <motion.tr
                    key={size.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <span className="text-sm font-medium text-gray-800">{getProductName(size.color_id)}</span>
                    </TD>
                    <TD>
                      <span className="text-sm text-gray-700">{getColorName(size.color_id)}</span>
                    </TD>
                    <TD>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {size.size}
                      </span>
                    </TD>
                    <TD className="text-right">
                      <ActionBtn
                        variant="ghost" size="sm" icon={Trash2}
                        onClick={() => setDeleteTarget(size.id)}
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
        title="Delete Size"
        message="Are you sure you want to delete this size?"
        confirmLabel="Delete"
      />
    </div>
  );
};

export default ViewSize;
