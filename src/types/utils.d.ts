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
