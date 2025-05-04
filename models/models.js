// Mock projects data
export const mockProjects = [];

// API functions
export function getClientProjectsSync() {
  console.warn('getClientProjectsSync is deprecated. Use getClientProjects() instead.');
  return [];
}

export async function getClientProjects() {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('Failed to fetch projects: ' + res.status);
  return res.json();
}

export async function updateServerProjects(newProjects) {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProjects)
  });
  if (!res.ok) throw new Error('Failed to update projects: ' + res.status);
  return res.json();
}

// Export team functions
export { getClientTeamMembers, getClientTeamMembersSync } from './team';
