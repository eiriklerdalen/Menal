import { createContext } from "react";
import type { AuthContextType, User } from "../types";

export const AuthContext = createContext<AuthContextType | null>(null);