/**
 * @typedef {Object} LoadPublicationsResponse
 * @property {string} status
 * @property {number} saved
 */

/**
 * Try to extract a LoadPublicationsResponse from a generic BackResponse.data
 * @param {{status?: string, saved?: any}} back
 * @returns {LoadPublicationsResponse|null}
 */
export function extractLoadPublicationsResponse(back) {
  if (!back || !back.data) return null;
  const d = back.data;
  if (d && (d.status !== undefined && d.saved !== undefined)) {
    return { status: String(d.status), saved: Number(d.saved) };
  }
  return null;
}

export default null;
