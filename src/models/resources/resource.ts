/**
 * @typedef {Object} Resource
 * @property {number} id
 * @property {string} title
 * @property {string} [description]
 * @property {'video' | 'pdf' | 'link'} type
 * @property {string} url
 * @property {string} [source]
 * @property {string} [createdAt]
 * @property {boolean} [featured]
 */

export const Resource = {};

/**
 * Parse a BackResponse containing a Spring Page of resources into a normalized shape.
 * BackResponse: { status, data, messages }, where data is a Spring Page:
 * { content, totalElements, totalPages, number, size, ... }
 * @param {{status?: string, data?: any, messages?: Array<string>}} back
 * @returns {{ items: Array<any>, total: number, totalPages: number, page: number, size: number }}
 */
export function parseResourcesResponse(back) {
  if (!back || !back.data) {
    return { items: [], total: 0, totalPages: 0, page: 0, size: 12 };
  }
  const d = back.data;
  const items = Array.isArray(d.content) ? d.content : [];
  const total = typeof d.totalElements === 'number' ? d.totalElements : items.length;
  const totalPages = typeof d.totalPages === 'number' ? d.totalPages : 1;
  const page = typeof d.number === 'number' ? d.number : 0;
  const size = typeof d.size === 'number' ? d.size : 12;
  return { items, total, totalPages, page, size };
}