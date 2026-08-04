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

export async function getAIPublicationStats() {
  try {
    const { data } = await api.get('/publications/ai-stats');
    return data;
  } catch (error) {
    if (error && error.response) {
      console.error('AI Stats API error response:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data,
      });
      throw error.response.data || { message: 'Server error', status: error.response.status };
    }
    console.error('AI Stats API error:', error);
    throw error;
  }
}

export async function getFilterOptions() {
  try {
    const { data } = await api.get('/publications/filter-options');
    return data;
  } catch (error) {
    console.error('Filter options API error:', error);
    return { publisher: [], entity_type: [], journal_name: [] };
  }
}

export async function createPublication(payload, pdfFile) {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('payload_json', JSON.stringify(payload));
    if (pdfFile) formData.append('file', pdfFile);
    const { data } = await api.post('/publications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 30000,
    });
    console.log('[FE-CREATE] response', data);
    return data;
  } catch (error) {
    if (error && error.response) {
      console.error('Publication create API error response:', {
        status: error.response.status,
        data: error.response.data,
      });
      throw error.response.data || { message: 'Server error', status: error.response.status };
    }
    console.error('Publication create API error:', error);
    throw error;
  }
}

export async function updatePublication(publicationId, payload, pdfFile) {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('payload_json', JSON.stringify(payload));
    if (pdfFile) formData.append('file', pdfFile);
    console.log('[FE-UPDATE] PUT /publications/' + publicationId, { payload, hasFile: Boolean(pdfFile) });
    const { data } = await api.put(`/publications/${publicationId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 30000,
    });
    console.log('[FE-UPDATE] response', data);
    return data;
  } catch (error) {
    if (error && error.response) {
      console.error('Publication update API error response:', {
        status: error.response.status,
        data: error.response.data,
      });
      throw error.response.data || { message: 'Server error', status: error.response.status };
    }
    console.error('Publication update API error:', error);
    throw error;
  }
}

export async function deletePublication(publicationId) {
  try {
    const token = localStorage.getItem('token');
    console.log('[FE-DELETE] DELETE /publications/' + publicationId);
    const { data } = await api.delete(`/publications/${publicationId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    console.log('[FE-DELETE] response', data);
    return data;
  } catch (error) {
    if (error && error.response) {
      console.error('Publication delete API error response:', {
        status: error.response.status,
        data: error.response.data,
      });
      throw error.response.data || { message: 'Server error', status: error.response.status };
    }
    console.error('Publication delete API error:', error);
    throw error;
  }
}

export default { getDspaceInfo, getSocialMediaMetrics, getFilterOptions, createPublication, updatePublication, deletePublication };
