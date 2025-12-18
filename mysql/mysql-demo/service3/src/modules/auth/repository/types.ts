
import { Prisma } from '../../../../generated/prisma/client';

export type UserForLogin = Prisma.UserGetPayload<{
    select: {
        id: true,
        username: true,
        nickname: true,
        password: true,
        updateTime: true,
        avatarSize: true,
        gender: true,
        selfIntro: true,
        role: true
    }
}>;