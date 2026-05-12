"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateTransaction from "./UpdateTransaction";
import { Receipt, Hash, Pencil, Trash2 } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Table, THead, TH,
  TBody, TR, TD, TableSkeleton, EmptyState, ErrorBanner,
  ConfirmDialog, Modal, FormField, Input
} from "../../components/Dashboard/DashUI";

const apiUrl = config.apiUrl;

const ViewTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({ tnxNumber: "", tnxId: "" });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`${apiUrl}/transactions`);
        const raw = response.data;
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.transactions) ? raw.transactions : Array.isArray(raw?.data) ? raw.data : [];
        setTransactions(list);
      } catch (err) {
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${apiUrl}/transactiondelete/${deleteTarget}`);
      setTransactions(prev => prev.filter(t => t.id !== deleteTarget));
    } catch {
      setError("Failed to delete transaction.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction.id);
    setFormData({ tnxNumber: transaction.tnxNumber, tnxId: transaction.tnxId });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingTransaction) return;
    try {
      await axios.put(`${apiUrl}/transactionsupdate/${editingTransaction}`, formData);
      setTransactions(prev =>
        prev.map(t => t.id === editingTransaction ? { ...t, ...formData } : t)
      );
      setEditingTransaction(null);
    } catch {
      setError("Failed to update transaction.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Transactions"
        icon={Receipt}
        badge={transactions.length}
        subtitle="Coin transaction records"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        <Table>
          <THead>
            <TH>#</TH>
            <TH>Transaction Number</TH>
            <TH>Transaction ID</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : transactions.length === 0 ? (
            <TBody>
              <tr><td colSpan={4}>
                <EmptyState icon={Receipt} title="No transactions" message="No coin transactions recorded yet." />
              </td></tr>
            </TBody>
          ) : (
            <TBody>
              {transactions.map((t, idx) => (
                <TR key={t.id}>
                  <TD className="text-gray-400 text-xs w-12">{idx + 1}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <Hash size={13} className="text-indigo-600" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{t.tnxNumber}</span>
                    </div>
                  </TD>
                  <TD>
                    <code className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono">
                      {t.tnxId}
                    </code>
                  </TD>
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <ActionBtn
                        variant="ghost" size="sm" icon={Pencil}
                        onClick={() => handleEditClick(t)}
                        title="Edit"
                      />
                      <ActionBtn
                        variant="ghost" size="sm" icon={Trash2}
                        onClick={() => setDeleteTarget(t.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete"
                      />
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          )}
        </Table>
      </SectionCard>

      {/* Edit modal */}
      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Edit Transaction"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField label="Transaction Number" required>
            <Input
              name="tnxNumber"
              value={formData.tnxNumber}
              onChange={handleChange}
              placeholder="e.g. TXN-001"
              required
            />
          </FormField>
          <FormField label="Transaction ID" required>
            <Input
              name="tnxId"
              value={formData.tnxId}
              onChange={handleChange}
              placeholder="Unique transaction identifier"
              required
            />
          </FormField>
          <div className="flex gap-3 justify-end pt-2">
            <ActionBtn variant="secondary" type="button" onClick={() => setEditingTransaction(null)}>
              Cancel
            </ActionBtn>
            <ActionBtn variant="primary" type="submit">
              Save Changes
            </ActionBtn>
          </div>
        </form>
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
};

export default ViewTransaction;
