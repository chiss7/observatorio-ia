import api from './axiosConfig';

export async function getDspaceInfo(payload) {
  try {
    const { data } = await api.post('/publications/paged', payload);
    return data;
  } catch (error) {
    // Enhanced logging to help debug server 500 responses during development
    if (error && error.response) {
      // Log detailed response info
      // eslint-disable-next-line no-console
      console.error('DSpace API error response:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
      });
      throw error.response.data || { message: 'Server error', status: error.response.status };
    }
    // Network or other Axios error
    // eslint-disable-next-line no-console
    console.error('DSpace API error:', error);
    throw error;
  }
}

export default { getDspaceInfo };
