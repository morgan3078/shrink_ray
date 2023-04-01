type DatabaseConstraintError = {
  type: 'unique' | 'check' | 'not null' | 'foreign key' | 'unknown';
  columnName?: string;
  message?: string;
};

type NewLinkRequest = {
  originalUrl: string;
};

type AuthRequest = {
  username: string;
  password: string;
};

type LinkIdParam = {
  targetLinkId: string;
  targetURL: string;
};

type UserIdParam = {
  targetUserId: string;
};
