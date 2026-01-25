// Shape / factory for DSpace request payload
export function createDspacePayload({ filters = [], page = 1, size = 5, order_by = 'id', order_dir = 'desc' } = {}) {
  return {
    filters,
    page,
    size,
    order_by,
    order_dir,
  };
}

// Helper to create a title/abstract filter (operation 'like')
export function filterBy(field, value) {
  return { field, operation: 'like', value };
}

export const defaultDspacePayload = createDspacePayload({
  filters: [],
  page: 1,
  size: 5,
  order_by: 'id',
  order_dir: 'desc',
});
