/**
 * @typedef {Object} Idea
 * @property {number} id
 * @property {string} name
 * @property {string} idea
 * @property {string} [ethicalConcern]
 * @property {string} status
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

/**
 * Map a raw backend idea item into an Idea object
 * @param {Object} item
 * @returns {Idea}
 */
export function mapIdea(item) {
  if (!item) return null;
  return {
    id: item.id,
    name: item.name,
    idea: item.idea,
    ethicalConcern: item.ethicalConcern,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/**
 * Parse a BackResponse containing a Spring Page of ideas into a normalized shape.
 * BackResponse: { status, data, messages }, where data is a Spring Page:
 * { content, totalElements, totalPages, number, size, ... }
 * @param {{status?: string, data?: any, messages?: Array<string>}} back
 * @returns {{ items: Array<Idea>, total: number, totalPages: number, page: number, size: number }}
 */
export function parseIdeasResponse(back) {
  if (!back || !back.data) {
    return { items: [], total: 0, totalPages: 0, page: 0, size: 5 };
  }
  const d = back.data;
  const items = Array.isArray(d.content) ? d.content.map(mapIdea).filter(Boolean) : [];
  const total = typeof d.totalElements === 'number' ? d.totalElements : items.length;
  const totalPages = typeof d.totalPages === 'number' ? d.totalPages : 1;
  const page = typeof d.number === 'number' ? d.number : 0;
  const size = typeof d.size === 'number' ? d.size : 5;
  return { items, total, totalPages, page, size };
}

export default null;
