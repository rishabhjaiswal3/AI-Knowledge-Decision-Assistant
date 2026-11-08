import { createContext } from "react";
import type { Organization, User } from "./api";

export type RegisterInput = { organization_name: string; name: string; email: string; password: string };

export type AuthState = {
  user: User | null;
  organization: Organization | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);
