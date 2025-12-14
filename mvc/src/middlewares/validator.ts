import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request } from "express";

export async function validateRequest(
    dtoClass: any,
    req: Request,
    options?: { allowId?: boolean }
) {
    // 取出id，只校验其余参数
    const { id, ...rest } = req.body;
    const instance = plainToInstance(dtoClass, rest);

    const errors = await validate(instance, {
        whitelist: true,
        forbidNonWhitelisted: true
    });

    if (errors.length) {
        return {
            valid: false,
            errors: errors.map(e => ({
                field: e.property,
                message: Object.values(e.constraints ?? {}).join(',')
            }))
        };
    }

    // 如果允许 id，则重新放回 req.body
    if (options?.allowId && id !== undefined) {
        req.body = { id, ...instance };
    } else {
        req.body = instance;
    }

    return { valid: true };
}
