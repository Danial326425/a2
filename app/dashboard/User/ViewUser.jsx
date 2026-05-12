"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { config } from "../../../config";
import UpdateUser from "./UpdateUser";
import { UserCog, Pencil, Trash2, Phone, Mail, Coins, Shield } from "lucide-react";
import {
  PageHeader, SectionCard, ActionBtn, Badge, Table, THead, TH,
  TBody, TR, TD, TableSkeleton, EmptyState, ErrorBanner, ConfirmDialog, SearchInput
} from "../../components/Dashboard/DashUI";
import { motion } from "framer-motion";

const apiUrl = config.apiUrl;

const roleBadge = (type) => {
  if (type === "admin")     return { variant: "purple",  label: "Admin" };
  if (type === "moderator") return { variant: "indigo",  label: "Moderator" };
  return                           { variant: "gray",    label: "User" };
};

const ViewUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ name: "", phone: "", type: "user", points: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/users`);
        setUsers(response.data.users || response.data);
      } catch {
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await axios.delete(`${apiUrl}/userdelete/${deleteTarget}`);
      const res = await axios.get(`${apiUrl}/users`);
      setUsers(res.data.users || res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleEdit = (user) => {
    if (user.type === "admin") { alert("Admin users cannot be edited"); return; }
    setEditingUser(user.id);
    setFormData({ name: user.name, phone: user.phone, type: user.type, points: user.points || 0 });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`${apiUrl}/usersupdate/${editingUser}`, formData);
      const res = await axios.get(`${apiUrl}/users`);
      setUsers(res.data.users || res.data);
      setEditingUser(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.phone?.includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader
        title="Users"
        icon={UserCog}
        badge={users.length}
        subtitle="Manage admin, moderator and customer accounts"
      />

      <ErrorBanner message={error} />

      <SectionCard noPad>
        {/* Search toolbar */}
        <div className="p-4 border-b border-gray-100">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone or email…"
            className="max-w-xs"
          />
        </div>

        <Table>
          <THead>
            <TH className="w-12">#</TH>
            <TH>User</TH>
            <TH>Phone</TH>
            <TH>Email</TH>
            <TH>Role</TH>
            <TH>Points</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          {loading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : filtered.length === 0 ? (
            <TBody>
              <tr><td colSpan={7}>
                <EmptyState icon={UserCog} title="No users found" message="No accounts match your search." />
              </td></tr>
            </TBody>
          ) : (
            <TBody>
              {filtered.map((user, idx) => {
                const rb = roleBadge(user.type);
                const initials = (user.name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                const isAdmin = user.type === "admin";
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50"
                  >
                    <TD className="text-gray-400 text-xs w-12">{idx + 1}</TD>
                    <TD>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white ${
                          isAdmin ? "bg-violet-500" : user.type === "moderator" ? "bg-indigo-500" : "bg-gray-400"
                        }`}>
                          {initials}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{user.name}</span>
                      </div>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                        <Phone size={12} className="text-gray-400" />
                        {user.phone || <span className="text-gray-400">—</span>}
                      </div>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                        {user.email ? (
                          <><Mail size={12} className="text-gray-400" />{user.email}</>
                        ) : <span className="text-gray-400">—</span>}
                      </div>
                    </TD>
                    <TD>
                      <Badge variant={rb.variant}>
                        {isAdmin && <Shield size={10} className="mr-1" />}
                        {rb.label}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-1 text-sm font-semibold text-amber-600">
                        <Coins size={13} />
                        {user.points || 0}
                      </div>
                    </TD>
                    <TD className="text-right">
                      {!isAdmin ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <ActionBtn
                            variant="ghost" size="sm" icon={Pencil}
                            onClick={() => handleEdit(user)} title="Edit"
                          />
                          <ActionBtn
                            variant="ghost" size="sm" icon={Trash2}
                            onClick={() => setDeleteTarget(user.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            disabled={deleteLoading}
                            title="Delete"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">protected</span>
                      )}
                    </TD>
                  </motion.tr>
                );
              })}
            </TBody>
          )}
        </Table>

        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
            {filtered.length} of {users.length} users
          </div>
        )}
      </SectionCard>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete User"
        message="This will permanently delete the user account and all associated data."
        confirmLabel="Delete User"
      />

      {editingUser && (
        <UpdateUser
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
          error={error}
          setError={setError}
          setEditingUers={() => setEditingUser(null)}
        />
      )}
    </div>
  );
};

export default ViewUser;
