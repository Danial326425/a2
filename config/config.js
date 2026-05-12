export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8000/storage',
  apiStorageUrl: process.env.NEXT_PUBLIC_API_STORAGE_URL || '/api/storage',
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
};