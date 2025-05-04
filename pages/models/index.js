import Link from 'next/link';

export { mockProjects, getClientProjectsSync, getClientProjects } from '../../models/models';
export { getClientTeamMembersSync, getClientTeamMembers } from '../../models/team';

export default function ModelsIndex() {
  return (
    <div>
      <h1>3D Models</h1>
      <p>Select a model from the list below:</p>
      <ul>
        <li>
          <Link href="/models/1">Model 1</Link>
        </li>
        <li>
          <Link href="/models/2">Model 2</Link>
        </li>
      </ul>
    </div>
  );
}
