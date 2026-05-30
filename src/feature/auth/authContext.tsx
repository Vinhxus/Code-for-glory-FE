import { createContext } from "react";
import type { AuthContextValue } from "./authProvider";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);