export interface RegisterProps {
  email: string;
  password: string;
  name: string;
  avatar_url?: string;
  role?: "CLIENT" | "FREELANCER";
}

export interface LoginProps {
  email: string;
  password: string;
}
