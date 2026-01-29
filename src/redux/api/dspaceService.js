import api from './axiosConfig';

export async function getDspaceInfo(payload) {
  try {
    const { data } = await api.post('/publications/paged', payload);
    return data;
  } catch (error) {
    // Enhanced logging to help debug server 500 responses during development
    if (error && error.response) {
      // Log detailed response info
      console.error('DSpace API error response:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
      });
      throw error.response.data || { message: 'Server error', status: error.response.status };
    }
    // Network or other Axios error
    console.error('DSpace API error:', error);
    throw error;
  }
}

export async function getSocialMediaMetrics() {
  try {
    const { data } = await api.get('/social-media/metrics');
    return data; // raw JSON returned as-is
  } catch (error) {
    if (error && error.response) {
      console.error('Metrics API error response:', {
        status: error.response.status,
        headers: error.response.headers,
        // avoid logging extremely large payloads fully
        dataPreview: Array.isArray(error.response.data)
          ? error.response.data.slice(0, 5)
          : error.response.data && typeof error.response.data === 'object'
          ? Object.keys(error.response.data).slice(0, 10)
          : error.response.data,
      });
      throw error.response.data || { message: 'Server error', status: error.response.status };
    }
    console.error('Metrics API error:', error);
    throw error;
  }
}

export default { getDspaceInfo, getSocialMediaMetrics };
