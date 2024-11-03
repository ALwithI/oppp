
import { z } from 'zod';

export const userSchema = z.object({
    email: z.string().email("Invalid email"),
    username: z.string().min(5).max(20),
    fullName: z.string().min(4, "fullname must be sup a 4"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const createUserSchema = userSchema; 
export const loginUserSchema = userSchema.omit({username: true, fullName: true});