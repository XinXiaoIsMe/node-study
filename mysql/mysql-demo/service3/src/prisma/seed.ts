import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcryptjs';

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('⏳ Seed 脚本开始...');

    // 生产环境保护
    if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️ 生产环境禁止运行 seed 脚本')
        return
    }

    // 初始化管理员账号
    const adminUsername = 'admin'
    const adminPassword = '123456' // dev/test 默认密码
    const adminNickname = '超级管理员'

    const admin = await prisma.user.upsert({
        where: { username: adminUsername },
        update: {
            nickname: adminNickname,
            // 如果你希望每次 seed 都重置密码，可以加下面
            password: bcrypt.hashSync(adminPassword, 10),
        },
        create: {
            username: adminUsername,
            password: bcrypt.hashSync(adminPassword, 10),
            nickname: adminNickname,
        }
    });

    console.log(`✅ Admin 用户已初始化: ${admin.username}`)

    console.log('🎉 Seed 脚本完成！')
}

main()
    .catch((e) => {
        console.error('❌ Seed 脚本出错:', e)
        process.exit(1)
    })
    .finally(() => {
        // 断开数据库
        prisma.$disconnect();
    });
