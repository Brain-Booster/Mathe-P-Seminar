export function getClientTeamMembersSync() {
  try {
    const teamData = localStorage.getItem('teamMembers');
    return teamData ? JSON.parse(teamData) : null;
  } catch (error) {
    console.error('Error getting team members from localStorage:', error);
    return null;
  }
}

export async function getClientTeamMembers() {
  try {
    const response = await fetch('/api/team');
    if (!response.ok) {
      throw new Error('Failed to fetch team members');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
}

export function updateTeamMembers(members) {
  try {
    localStorage.setItem('teamMembers', JSON.stringify(members));
    return Promise.resolve(members);
  } catch (error) {
    console.error('Error updating team members in localStorage:', error);
    return Promise.reject(error);
  }
}
