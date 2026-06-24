import { useState, useCallback } from 'react';
import api from './api';
import toast from 'react-hot-toast';

/**
 * Custom hook to handle API requests with loading and error states.
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, url, data = null, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api({
        method,
        url,
        data,
        ...options,
      });
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'An unexpected error occurred';
      setError(errorMessage);
      if (!options.silent) {
        toast.error(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, options) => request('GET', url, null, options), [request]);
  const post = useCallback((url, data, options) => request('POST', url, data, options), [request]);
  const put = useCallback((url, data, options) => request('PUT', url, data, options), [request]);
  const patch = useCallback((url, data, options) => request('PATCH', url, data, options), [request]);
  const del = useCallback((url, options) => request('DELETE', url, null, options), [request]);

  return { loading, error, request, get, post, put, patch, del };
};

export default useApi;
