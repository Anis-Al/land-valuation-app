export type Session = {
  id: string;
  data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  expires?: Date;
};

export type CreateSessionInput = {
  data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  expires?: Date;
};

export type UpdateSessionInput = {
  data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  expires?: Date;
};
