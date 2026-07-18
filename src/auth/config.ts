// Backward-compat shim. Prefer importing from "./user-auth" or "./admin-auth".
// `auth` here resolves the USER (peserta) session — the previous default.
// Admin-area code must import adminAuth from "./admin-auth".
import { userAuth } from "./user-auth";

export const { auth, signIn, signOut, handlers } = userAuth;
