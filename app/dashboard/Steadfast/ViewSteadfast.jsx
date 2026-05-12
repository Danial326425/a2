"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateSteadfast from "./UpdateSteadfast";
import UpdatePathao from "./UpdatePathao";
import { Truck, Pencil, Trash2, Key, Lock } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog,
} from "../../components/Dashboard/DashUI";
import { motion, AnimatePresence } from "framer-motion";

const apiUrl = config.apiUrl;

const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      active
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);

const ViewCourierConfig = () => {
  const [activeTab, setActiveTab] = useState("steadfast");
  const [steadfasts, setSteadfasts] = useState([]);
  const [pathaoData, setPathaoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingSteadfast, setEditingSteadfast] = useState(null);
  const [editingPathao, setEditingPathao] = useState(false);
  const [deleteSteadfastTarget, setDeleteSteadfastTarget] = useState(null);
  const [deletePathaoOpen, setDeletePathaoOpen] = useState(false);

  const [formDataSteadfast, setFormDataSteadfast] = useState({ apiKey: "", secretKey: "" });
  const [formDataPathao, setFormDataPathao] = useState({
    pathao_client_id: "", pathao_client_secret: "", pathao_email: "",
    pathao_password: "", pathao_store_id: "",
  });

  useEffect(() => {
    Promise.all([
      axios.get(`${apiUrl}/steadfasts`),
      axios.get(`${apiUrl}/pathao/settings`),
    ])
      .then(([sf, pt]) => {
        setSteadfasts(sf.data || []);
        setPathaoData(pt.data);
      })
      .catch(() => setError("Failed to load courier settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteSteadfast = async () => {
    if (!deleteSteadfastTarget) return;
    try {
      await axios.delete(`${apiUrl}/steadfastdelete/${deleteSteadfastTarget}`);
      setSteadfasts(prev => prev.filter(i => i.id !== deleteSteadfastTarget));
    } catch { setError("Failed to delete Steadfast config"); }
    finally { setDeleteSteadfastTarget(null); }
  };

  const handleDeletePathao = async () => {
    try {
      await axios.delete(`${apiUrl}/pathao/delete`);
      setPathaoData(null);
    } catch { setError("Failed to delete Pathao config"); }
    finally { setDeletePathaoOpen(false); }
  };

  const handleEditSteadfast = (item) => {
    setEditingSteadfast(item.id);
    setFormDataSteadfast({ apiKey: item.apiKey || "", secretKey: item.secretKey || "" });
  };

  const handleEditPathao = () => {
    if (pathaoData) {
      setEditingPathao(true);
      setFormDataPathao({
        pathao_client_id: pathaoData.pathao_client_id || "",
        pathao_client_secret: pathaoData.pathao_client_secret || "",
        pathao_email: pathaoData.pathao_email || "",
        pathao_password: pathaoData.pathao_password || "",
        pathao_store_id: pathaoData.pathao_store_id || "",
      });
    }
  };

  const maskKey = (key) => key ? key.slice(0, 6) + "••••••••" : "—";

  return (
    <div>
      <PageHeader
        title="Courier Config"
        icon={Truck}
        subtitle="Manage Steadfast and Pathao courier API credentials"
      />

      <ErrorBanner message={error} />

      <div className="flex items-center gap-2 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
        <TabBtn active={activeTab === "steadfast"} onClick={() => setActiveTab("steadfast")}>Steadfast</TabBtn>
        <TabBtn active={activeTab === "pathao"} onClick={() => setActiveTab("pathao")}>Pathao</TabBtn>
      </div>

      {activeTab === "steadfast" && (
        <SectionCard noPad>
          <Table>
            <THead>
              <TH>API Key</TH>
              <TH>Secret Key</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            {loading ? (
              <TableSkeleton rows={2} cols={3} />
            ) : steadfasts.length === 0 ? (
              <tbody><tr><td colSpan={3}>
                <EmptyState icon={Key} title="No Steadfast config" message="Add your Steadfast API credentials." />
              </td></tr></tbody>
            ) : (
              <tbody>
                <AnimatePresence initial={false}>
                  {steadfasts.map(item => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                    >
                      <TD>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                            <Key size={13} className="text-amber-600" />
                          </div>
                          <code className="text-sm font-mono text-gray-700">{maskKey(item.apiKey)}</code>
                        </div>
                      </TD>
                      <TD>
                        <code className="text-sm font-mono text-gray-500">{maskKey(item.secretKey)}</code>
                      </TD>
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={() => handleEditSteadfast(item)} title="Edit" />
                          <ActionBtn
                            variant="ghost" size="sm" icon={Trash2}
                            onClick={() => setDeleteSteadfastTarget(item.id)}
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
      )}

      {activeTab === "pathao" && (
        <SectionCard noPad>
          <Table>
            <THead>
              <TH>Client ID</TH>
              <TH>Client Secret</TH>
              <TH>Email</TH>
              <TH>Store ID</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            {loading ? (
              <TableSkeleton rows={1} cols={5} />
            ) : !pathaoData ? (
              <tbody><tr><td colSpan={5}>
                <EmptyState icon={Lock} title="No Pathao config" message="Add your Pathao courier credentials." />
              </td></tr></tbody>
            ) : (
              <tbody>
                <motion.tr
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                >
                  <TD><code className="text-sm font-mono text-gray-700">{pathaoData.pathao_client_id}</code></TD>
                  <TD><span className="text-sm text-gray-500">••••••••</span></TD>
                  <TD><span className="text-sm text-gray-700">{pathaoData.pathao_email}</span></TD>
                  <TD><code className="text-sm font-mono text-gray-700">{pathaoData.pathao_store_id}</code></TD>
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <ActionBtn variant="ghost" size="sm" icon={Pencil} onClick={handleEditPathao} title="Edit" />
                      <ActionBtn
                        variant="ghost" size="sm" icon={Trash2}
                        onClick={() => setDeletePathaoOpen(true)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete"
                      />
                    </div>
                  </TD>
                </motion.tr>
              </tbody>
            )}
          </Table>
        </SectionCard>
      )}

      <ConfirmDialog
        isOpen={!!deleteSteadfastTarget}
        onConfirm={handleDeleteSteadfast}
        onCancel={() => setDeleteSteadfastTarget(null)}
        title="Delete Steadfast Config"
        message="Are you sure you want to delete this Steadfast configuration?"
        confirmLabel="Delete"
      />

      <ConfirmDialog
        isOpen={deletePathaoOpen}
        onConfirm={handleDeletePathao}
        onCancel={() => setDeletePathaoOpen(false)}
        title="Delete Pathao Config"
        message="Are you sure you want to delete the Pathao configuration?"
        confirmLabel="Delete"
      />

      {editingSteadfast && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start justify-end">
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="w-full max-w-lg bg-white min-h-screen shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Key size={15} className="text-amber-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Edit Steadfast Credentials</h2>
                </div>
                <button onClick={() => setEditingSteadfast(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdateSteadfast
                  formData={formDataSteadfast}
                  setFormData={setFormDataSteadfast}
                  onCancel={() => setEditingSteadfast(null)}
                  onSuccess={(d) => {
                    setSteadfasts(prev => prev.map(i => i.id === editingSteadfast ? { ...i, ...d } : i));
                    setEditingSteadfast(null);
                  }}
                  id={editingSteadfast}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {editingPathao && (
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
                    <Lock size={15} className="text-indigo-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Edit Pathao Credentials</h2>
                </div>
                <button onClick={() => setEditingPathao(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">✕</button>
              </div>
              <div className="p-6">
                <UpdatePathao
                  formData={formDataPathao}
                  setFormData={setFormDataPathao}
                  onCancel={() => setEditingPathao(false)}
                  onSuccess={(d) => { setPathaoData(d); setEditingPathao(false); }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCourierConfig;
