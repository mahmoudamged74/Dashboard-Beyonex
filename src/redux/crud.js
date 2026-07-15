import axiosInstance from '../api/axiosInstance';

/**
 * Extract payload from Laravel-style API responses.
 */
const extractData = (res) => res?.data?.data ?? res?.data;

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  'Request failed';

/**
 * GET — fetch a resource or list.
 */
export const crudGet = async (url, config = {}) => {
  try {
    const res = await axiosInstance.get(url, config);
    return extractData(res);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * POST — create a resource (JSON or FormData).
 */
export const crudCreate = async (url, data, config = {}) => {
  try {
    const res = await axiosInstance.post(url, data, config);
    return { data: extractData(res), status: res.status, message: res.data?.message };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * PUT — update with FormData (multipart). Used when API expects PUT + file upload.
 */
export const crudPutForm = async (url, formData, config = {}) => {
  try {
    const res = await axiosInstance.put(url, formData, config);
    return { data: extractData(res), status: res.status, message: res.data?.message };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * PUT — update a resource (JSON).
 */
export const crudUpdate = async (url, data, config = {}) => {
  try {
    const res = await axiosInstance.put(url, data, config);
    return { data: extractData(res), status: res.status, message: res.data?.message };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * POST with _method=PUT — Laravel FormData update.
 */
export const crudUpdateForm = async (url, formData, config = {}) => {
  try {
    const body = formData instanceof FormData ? formData : new FormData();
    if (formData instanceof FormData && !formData.has('_method')) {
      body.append('_method', 'PUT');
    }
    const res = await axiosInstance.post(url, body, config);
    return { data: extractData(res), status: res.status, message: res.data?.message };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * DELETE — remove a resource.
 */
export const crudDelete = async (url, config = {}) => {
  try {
    const res = await axiosInstance.delete(url, config);
    return { data: extractData(res), status: res.status, message: res.data?.message };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Unified CRUD dispatcher for about sub-resources and similar patterns.
 */
export const crudOperation = async ({ action, baseUrl, id, payload }) => {
  const isFormData = payload instanceof FormData;

  switch (action) {
    case 'add':
      return crudCreate(baseUrl, payload);
    case 'edit': {
      const url = `${baseUrl}/${id}`;
      if (isFormData) {
        if (!payload.has('_method')) payload.append('_method', 'PUT');
        return crudCreate(url, payload);
      }
      return crudUpdate(url, payload);
    }
    case 'delete':
      return crudDelete(`${baseUrl}/${id}`);
    default:
      throw new Error(`Unknown CRUD action: ${action}`);
  }
};
