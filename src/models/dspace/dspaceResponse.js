// Helper to normalize DSpace response shape
export function parseDspaceResponse(raw) {
  if (!raw) return { items: [], total: 0, page: 1, size: 5 };
  const items = Array.isArray(raw.items) ? raw.items : [];
  const total = typeof raw.total === 'number' ? raw.total : 0;
  const page = typeof raw.page === 'number' ? raw.page : 1;
  const size = typeof raw.size === 'number' ? raw.size : 5;
  return { items, total, page, size };
}

export default parseDspaceResponse;
