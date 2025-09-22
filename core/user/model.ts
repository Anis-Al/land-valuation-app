export type UserProfile = {
  firstName: string;
  lastName: string;
};

export type UserAuth = {
  username?: string;
  password?: string;
};

export type User = {
  id: string;
  auth: UserAuth;
  profile: UserProfile;
};
