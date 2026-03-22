export interface RegisterProps {
  email: string;
  password: string;
  name: string;
  avatar_url?: string;
}

export interface LoginProps {
  email: string;
  password: string;
}
