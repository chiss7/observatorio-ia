// Helpers to map contributors array into displayable strings
export function getContributorsByRole(contributors = [], role) {
  if (!Array.isArray(contributors)) return [];
  return contributors
    .filter((c) => (c.role || '').toLowerCase() === (role || '').toLowerCase())
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function formatContributors(contributors = []) {
  if (!Array.isArray(contributors) || contributors.length === 0) return '';
  const authors = getContributorsByRole(contributors, 'author').map((c) => c.name);
  const advisors = getContributorsByRole(contributors, 'advisor').map((c) => c.name);

  let parts = [];
  if (authors.length) {
    const label = authors.length === 1 ? 'Autor' : 'Autores';
    parts.push(`${label}: ${authors.join(', ')}`);
  }
  if (advisors.length) {
    const label = advisors.length === 1 ? 'Tutor' : 'Tutores';
    parts.push(`${label}: ${advisors.join(', ')}`);
  }
  if (!parts.length) return contributors.map((c) => c.name).join(', ');
  return parts.join(' — ');
}

export default { getContributorsByRole, formatContributors };
