import { getUsers } from '@/app/actions';
import { User } from '@/types';

export default async function Loading() {
  const users: User[] = await getUsers();

  const userIds = users.map((user) => user.id.trim());

  console.log(userIds);

  return <div>Loading...</div>;
}
