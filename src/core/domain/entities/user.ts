export interface User {
  id: string;
  userName: string;
  password?: string;
  namaLengkap: string;
  role: "admin" | "buyer";
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface AuthSession {
  user: User;
  token?: string;
}
