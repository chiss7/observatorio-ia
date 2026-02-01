/**
 * @typedef {Object} BackResponse
 * @property {string} status
 * @property {any} data
 * @property {Array<string>} messages
 */

/**
 * @typedef {Object} CreatePublicationResponse
 * @property {string|number} id
 */

/**
 * Try to extract a CreatePublicationResponse from a generic BackResponse.data
 * @param {BackResponse} back
 * @returns {CreatePublicationResponse|null}
 */
export function extractCreatePublicationResponse(back) {
  if (!back || !back.data) return null;
  const d = back.data;
  if (d && (d.id !== undefined && d.id !== null)) {
    return { id: d.id };
  }
  return null;
}

export default null;
