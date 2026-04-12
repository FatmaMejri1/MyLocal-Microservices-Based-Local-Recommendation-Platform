import api from './axiosConfig';

/**
 * Get all reports
 */
export const getReports = (status = null) => {
  const url = status ? `/reports?status=${status}` : '/reports';
  return api.get(url);
};

/**
 * Get report by ID
 */
export const getReportById = (id) => {
  return api.get(`/reports/${id}`);
};

/**
 * Create a new report
 */
export const createReport = (reportData) => {
  return api.post('/reports/', reportData);
};

/**
 * Update report status
 */
export const updateReportStatus = (id, status) => {
  return api.patch(`/reports/${id}/status`, { status });
};

/**
 * Delete report
 */
export const deleteReport = (id) => {
  return api.delete(`/reports/${id}`);
};

/**
 * Get report statistics
 */
export const getReportStats = () => {
  return api.get('/reports/stats');
};

