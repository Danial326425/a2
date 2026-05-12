"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateMenu from "./UpdateMenu";
import { Navigation, Pencil, Trash2, ExternalLink } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog, Badge,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;

const typeVariant = { header: "info", footer: "default", sidebar: "warning" };
const typeLabel = { header: "Header", footer: "Footer", sidebar: "Sidebar" };

const ViewMenu = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    name: "", url: "", menu_type: "header", order: 1,
  });

  useEffect(() => {
    axios.get(`${apiUrl}/menus`)
      .then(r => setMenus(r.data || []))
      .catch(() => setError("Failed to load menus"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/menudelete/${deleteTarget}`);
      setMenus(prev => prev.filter(m => m.id !== deleteTarget));
    } catch { setError("Failed to delete menu"); }
    finally { setDeleteTarget(null); }
  };

  const handleEditClick = (menu) => {
    setEditingMenu(menu.id);
    setFormData({ name: menu.name, url: menu.url, menu_type: menu.menu_type, order: menu.order });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === "order" ? parseInt(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingMenu) return;
    try {
      await axios.put(`${apiUrl}/menusupdate/${editingMenu}`, formData);
      setMenus(prev => prev.map(m => m.id === editingMenu ? { ...m, ...formData } : m));
      setEditingMenu(null);
    } catch { setError("Failed to update menu"); }
  };

  const truncateUrl = (url) => url && url.length > 35 ? url.slice(0, 35) + "…" : url;

  return (
    <div>
      <PageHeader
        title="Navigation Menus"
        icon={Navigation}
        badge={menus.length}
        subtitle="Manage header, footer, and sidebar navigation links"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>Name</TH>
            <TH>URL</TH>
            <TH>Type</TH>
            <TH>Order</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : menus.length === 0 ? (
            <tbody><tr><td colSpan={5}>
              <EmptyState icon={Navigation} title="No menus" message="Add navigation links to appear in your store." />
            </td></tr></tbody>
          ) : (
            <tbody>
              <AnimatePresence initial={false}>
                {menus.map(menu => (
                  <motion.tr
                    key={menu.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD>
                      <span className="font-medium text-gray-900 text-sm">{menu.name}</span>
                    </TD>
                    <TD>
                      <a
                        href={menu.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        <span>{truncateUrl(menu.url)}</span>
                        <ExternalLink size={11} />
                      </a>
                    </TD>
                    <TD>
                      <Badge variant={typeVariant[menu.menu_type] || "default"}>
                        {typeLabel[menu.menu_type] || menu.menu_type}
                      </Badge>
                    </TD>
                    <TD>
                      <span className="text-sm text-gray-600">{menu.order}</span>
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditClick(menu)} title="Edit" />
                        <ActionBtn
                          variant="ghost" size="sm" icon={Trash2}
                          onClick={() => setDeleteTarget(menu.id)}
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
        title="Delete Menu"
        message="Are you sure you want to delete this menu item?"
        confirmLabel="Delete"
      />

      {editingMenu && (
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
                  <h2 className="text-base font-semibold text-gray-900">Edit Menu Item</h2>
                </div>
                <button onClick={() => setEditingMenu(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateMenu
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  onCancel={() => setEditingMenu(null)}
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

export default ViewMenu;
