import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { User } from '@core/user';

export type UserAvatarProps = {
  user: User;
};

export function UserAvatar({ user }: UserAvatarProps) {
  const abbreviation = [user.profile.firstName, user.profile.lastName]
    .map((p) => (p && p.length > 0 ? p[0] : ''))
    .join('')
    .toUpperCase();

  return (
    <Avatar className="rounded-full">
      <AvatarFallback>{abbreviation}</AvatarFallback>
    </Avatar>
  );
}
