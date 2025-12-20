import { Request } from "express";

export type Role = "student" | "mentor" | "admin";

export interface AuthUser {
    userId: string;
    role: Role;
}

export interface AuthRequest extends Request {
    user?: AuthUser;
}
