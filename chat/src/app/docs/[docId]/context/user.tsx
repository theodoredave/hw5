"use client";
import { createContext, useState } from "react";
export type User = {
  displayId: string;
};
export type UserContext = {
  user: User | null;
  setUser: (user: User) => void;
};

export const UserContext = createContext<UserContext>({
  user: null,
  setUser: () => {},
});

type Props = {
  children: React.ReactNode;
};
export function UserProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
