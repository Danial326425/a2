/**
 * BD phone-number utilities — consolidates logic that was previously duplicated
 * across OrderPageClient, CheckoutSection, and the storefront contact form.
 *
 * BD mobile rule: 11 digits, starts with `01[3-9]` followed by 8 digits.
 */

const BENGALI_TO_ENGLISH = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
};

/** Convert Bengali digits to English and strip non-digits. */
export function normalizeBnPhone(input) {
  if (input == null) return '';
  return String(input)
    .replace(/[০-৯]/g, (m) => BENGALI_TO_ENGLISH[m] || m)
    .replace(/\D/g, '');
}

const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

/** True when the string is a fully-valid BD mobile number. */
export function isValidBdPhone(s) {
  return BD_PHONE_REGEX.test(s);
}

/**
 * Returns a Bengali error message describing what's wrong with the supplied
 * value, or '' when it's valid. Empty string is treated as "not yet typed"
 * and returns empty (no error displayed until something is entered).
 */
export function getBdPhoneError(s) {
  if (!s) return '';
  if (s.length < 11) return 'মোবাইল নম্বর অবশ্যই ১১ ডিজিটের হতে হবে';
  if (!s.startsWith('01')) return 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01...)';
  if (!BD_PHONE_REGEX.test(s)) return 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 01[3-9]XXXXXXXX)';
  return '';
}

/**
 * Format a BD phone for Facebook Conversions API (`+88` prefix, all digits).
 * Returns `''` when input is not a valid 11-digit number.
 */
export function formatBdPhoneForCAPI(s) {
  const cleaned = normalizeBnPhone(s);
  return isValidBdPhone(cleaned) ? `88${cleaned}` : '';
}
