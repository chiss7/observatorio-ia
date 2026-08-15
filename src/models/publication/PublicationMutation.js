/**
 * @typedef {Object} PublicationUpdatePayload
 * @property {string} title
 * @property {string} abstract
 * @property {string} type
 * @property {Array<string>} subjects
 * @property {Array<{name: string, role: string}>} contributors
 */

/**
 * @typedef {Object} PublicationMutationResponse
 * @property {boolean} success
 * @property {number|string} id
 */

/**
 * Build the PUT /publications/{id} payload from a list item
 * (PublicationDTO from /publications/paged).
 * @param {Object} item
 * @returns {PublicationUpdatePayload}
 */
export function buildPublicationUpdatePayload(item) {
  const subjects = Array.isArray(item.subjects) ? item.subjects.map((s) => (typeof s === 'string' ? s : s.name)).filter(Boolean) : [];
  const contributors = Array.isArray(item.contributors)
    ? item.contributors.map((c) => ({ name: c.name, role: c.role || 'author' }))
    : [];
  return {
    title: item.title || item.name || '',
    abstract: item.abstract || item.original_abstract || '',
    type: item.type === 'Publication' ? 'Publication' : 'AcademicPublication',
    subjects,
    contributors,
  };
}

/**
 * Extract { success, id } from the mutation response `{ success, id }`.
 * @param {{success?: any, id?: any}} back
 * @returns {PublicationMutationResponse|null}
 */
export function extractPublicationMutationResponse(back) {
  if (!back) return null;
  if (back.id !== undefined && back.id !== null) {
    return { success: Boolean(back.success), id: back.id };
  }
  return null;
}

/**
 * Publications created by the admin are the only editable/deletable ones:
 * entity_type AcademicPublication|Publication AND classified_at null.
 * @param {Object} item
 * @returns {boolean}
 */
export function isEditablePublication(item) {
  if (!item) return false;
  if (item.entity_type !== 'AcademicPublication' && item.entity_type !== 'Publication') return false;
  return !item.classified_at;
}

export default null;
