import * as z from "zod";

export const ThreadValidation = z.object({
    //thread: z.string().nonempty().min(3, { message: 'Minimum 3 characters' }),
    thread: z
        .string({ 
            required_error: 'Name is required', 
            invalid_type_error: 'Name must be a string' 
        })
        .min(3, { message: 'Minimum 3 characters' }),
    accountId: z.string()
});

export const CommentValidation = z.object({
    thread: z
        .string({ 
            required_error: 'Name is required', 
            invalid_type_error: 'Name must be a string' 
        })
        .min(3, { message: 'Minimum 3 characters' })
});