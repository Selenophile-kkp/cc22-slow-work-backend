import type { ClaimsProps } from "@/Services/jwt.service";

declare global {
  namespace Express {
    interface User extends ClaimsProps {}
  }
}
