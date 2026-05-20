import axios from "axios";
import { config } from "@/config/config";

const apiUrl = config.apiUrl;

const authHeaders = () => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const normalizeSettings = (payload) => {
  if (payload?.settings) return payload.settings;
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  if (payload?.groups) {
    return Object.values(payload.groups).flat().reduce((acc, item) => {
      acc[item.field_key] = item.value ?? "";
      return acc;
    }, {});
  }
  return {};
};

export async function fetchSeoSettings() {
  try {
    const response = await axios.get(`${apiUrl}/seo/settings`, {
      headers: authHeaders(),
    });
    return normalizeSettings(response.data);
  } catch (error) {
    if (![404, 405].includes(error.response?.status)) throw error;
    const response = await axios.get(`${apiUrl}/seo/home`);
    return normalizeSettings(response.data);
  }
}

export async function saveSeoSettings(settings) {
  try {
    const response = await axios.put(
      `${apiUrl}/seo/settings`,
      { settings },
      { headers: authHeaders() }
    );
    return normalizeSettings(response.data) || settings;
  } catch (error) {
    if (![404, 405].includes(error.response?.status)) throw error;
    const response = await axios.put(
      `${apiUrl}/admin/seo/home`,
      {
        settings: Object.entries(settings).map(([field_key, value]) => ({
          field_key,
          value: value ?? "",
        })),
      },
      { headers: authHeaders() }
    );
    return normalizeSettings(response.data) || settings;
  }
}

export async function uploadSeoImage(type, file) {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file);

  const response = await axios.post(`${apiUrl}/admin/seo/home/field/${type}`, formData, {
    headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
  });
  return response.data?.data?.value || response.data?.url || response.data?.path;
}

export async function removeSeoImage(type) {
  try {
    await axios.delete(`${apiUrl}/seo/settings/image/${type}`, {
      headers: authHeaders(),
    });
  } catch (error) {
    if (![404, 405].includes(error.response?.status)) throw error;
    await axios.put(
      `${apiUrl}/admin/seo/home/field/${type}`,
      { value: "" },
      { headers: authHeaders() }
    );
  }
}
