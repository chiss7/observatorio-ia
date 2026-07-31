import api from '../utils/api';

/**
 * Fetch the paginated list of community-approved ideas.
 * @param {{ page?: number, size?: number }} params page is 0-based (Spring)
 * @returns {Promise<any>} raw BackResponse
 */
export async function getApprovedIdeas({ page = 0, size = 5 } = {}) {
  try {
    const { data } = await api.get('/ideas/approved', {
      params: { page, size },
      headers: { 'x-skip-auth': 'true' },
    });
    return data;
  } catch (error) {
    console.error('Error obteniendo ideas aprobadas:', error);
    throw error;
  }
}

export default { getApprovedIdeas };
