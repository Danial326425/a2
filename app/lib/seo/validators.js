export const isUrl = (value) => {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const isHexColor = (value) => !value || /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
export const isGa4Id = (value) => !value || /^G-[A-Z0-9]{6,}$/i.test(value);
export const isGtmId = (value) => !value || /^GTM-[A-Z0-9]{4,}$/i.test(value);
export const isPixelId = (value) => !value || /^\d{6,30}$/.test(value);
export const isTwitterHandle = (value) => !value || /^@?[A-Za-z0-9_]{1,15}$/.test(value);

export const validateJson = (value) => {
  if (!value?.trim()) return { valid: true };
  try {
    JSON.parse(value);
    return { valid: true };
  } catch (error) {
    return { valid: false, message: error.message };
  }
};

export const validateSeoSettings = (settings) => {
  const errors = {};

  if (!isUrl(settings.canonical_url)) errors.canonical_url = "Enter a valid http or https URL";
  if (!isUrl(settings.og_url)) errors.og_url = "Enter a valid http or https URL";
  if (!isHexColor(settings.theme_color)) errors.theme_color = "Use a valid hex color";
  if (!isGa4Id(settings.ga4_id)) errors.ga4_id = "Use G-XXXXXXXXXX format";
  if (!isGtmId(settings.gtm_id)) errors.gtm_id = "Use GTM-XXXXXXX format";
  if (!isPixelId(settings.facebook_pixel_id)) errors.facebook_pixel_id = "Use numeric Pixel ID only";
  if (!isTwitterHandle(settings.twitter_handle)) errors.twitter_handle = "Use a valid @handle";
  if (!isTwitterHandle(settings.twitter_creator)) errors.twitter_creator = "Use a valid @handle";

  const json = validateJson(settings.json_ld);
  if (!json.valid) errors.json_ld = json.message;

  return errors;
};

export const imageUrlFor = (path, storageBase = "") => {
  if (!path) return "";
  if (path.startsWith("data:") || path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${storageBase}/${path}`.replace(/([^:]\/)\/+/g, "$1");
};
