import type { Request, Response } from 'express'
import multer from 'multer'
import sharp from 'sharp'
import { createUser, findUserProfileById, updateUserAvatar, updateUserProfile, getUserAvatar } from '../models/userModel'
import { updateSession } from '../models/sessionStore'
import type { Role } from '../types/session'

const MAX_BASE64_AVATAR_SIZE = 2 * 1024 * 1024

const parseBase64Avatar = (input: unknown) => {
  if (typeof input !== 'string' || !input) {
    return null
  }
  const match = input.match(/^data:(.+);base64,(.+)$/)
  if (!match) {
    return null
  }
  const mime = match[1]
  if (!mime.startsWith('image/')) {
    return null
  }
  const buffer = Buffer.from(match[2], 'base64')
  if (buffer.length > MAX_BASE64_AVATAR_SIZE) {
    throw new Error('AvatarTooLarge')
  }
  return {
    data: buffer,
    mime,
    size: buffer.length,
  }
}

export const createUserController = async (req: Request, res: Response) => {
  const { username, password, nickname = null, role = 'user', avatar: avatarBase64 } = req.body ?? {}

  if (!username || !password) {
    res.status(400).json({ message: '用户名和密码不能为空' })
    return
  }

  const normalizedRole: Role = role === 'admin' ? 'admin' : 'user'
  let avatarPayload: ReturnType<typeof parseBase64Avatar> = null

  if (avatarBase64) {
    try {
      avatarPayload = parseBase64Avatar(avatarBase64)
      if (!avatarPayload) {
        res.status(400).json({ message: '头像格式不正确，请上传 JPG 或 PNG 图片' })
        return
      }
    } catch (error) {
      if ((error as Error).message === 'AvatarTooLarge') {
        res.status(400).json({ message: '头像大小请控制在 2MB 以内' })
      } else {
        res.status(400).json({ message: '头像格式不正确，请重新上传' })
      }
      return
    }
  }

  try {
    const insertId = await createUser({
      username,
      password,
      nickname,
      role: normalizedRole,
      avatar: avatarPayload,
    })

    res.status(201).json({
      message: '用户创建成功',
      user: {
        id: insertId,
        username,
        nickname,
        role: normalizedRole,
      },
    })
  } catch (error) {
    const err = error as { code?: string }
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: '用户名已存在' })
      return
    }

    console.error('Create user failed:', error)
    res.status(500).json({ message: '服务器错误，请稍后重试' })
  }
}

export const getProfile = async (req: Request, res: Response) => {
  if (!req.session) {
    res.status(401).json({ message: '未授权' })
    return
  }

  const profile = await findUserProfileById(req.session.userId)
  if (!profile) {
    res.status(404).json({ message: '用户不存在' })
    return
  }

  res.json({ profile })
}

export const updateProfile = async (req: Request, res: Response) => {
  if (!req.session) {
    res.status(401).json({ message: '未授权' })
    return
  }

  const { nickname = null, gender = null, selfIntro = null } = req.body ?? {}

  const normalizedGender =
    gender === null || gender === undefined ? null : Number(gender)

  const genderValue =
    normalizedGender === null ||
    Number.isNaN(normalizedGender) ||
    normalizedGender <= 0
      ? null
      : normalizedGender

  const success = await updateUserProfile(req.session.userId, {
    nickname,
    gender: genderValue,
    selfIntro,
  })

  if (!success) {
    res.status(500).json({ message: '更新失败，请稍后重试' })
    return
  }

  const profile = await findUserProfileById(req.session.userId)

  updateSession(req.session.token, {
    nickname: profile?.nickname ?? req.session.nickname,
    gender: profile?.gender ?? req.session.gender ?? null,
    selfIntro: profile?.selfIntro ?? req.session.selfIntro ?? null,
    avatarUpdatedAt: profile?.avatarUpdatedAt ?? req.session.avatarUpdatedAt ?? null,
  })

  res.json({ profile })
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB 限制
  },
})

export const avatarUploadMiddleware = upload.single('avatar')

export const updateAvatar = async (req: Request, res: Response) => {
  if (!req.session) {
    res.status(401).json({ message: '未授权' })
    return
  }

  if (!req.file) {
    res.status(400).json({ message: '请上传头像文件' })
    return
  }

  try {
    const compressed = await sharp(req.file.buffer)
      .rotate()
      .resize(320, 320, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer()

    await updateUserAvatar(req.session.userId, {
      data: compressed,
      mime: 'image/jpeg',
      size: compressed.length,
    })

    const profile = await findUserProfileById(req.session.userId)
    updateSession(req.session.token, {
      avatarUpdatedAt: profile?.avatarUpdatedAt ?? new Date().toISOString(),
    })
    res.json({ message: '头像已更新', profile })
  } catch (error) {
    console.error('compress avatar failed:', error)
    res.status(500).json({ message: '头像上传失败，请重试' })
  }
}

export const getAvatar = async (req: Request, res: Response) => {
  if (!req.session) {
    res.status(401).json({ message: '未授权' })
    return
  }

  const avatar = await getUserAvatar(req.session.userId)
  if (!avatar) {
    res.status(404).json({ message: '未上传头像' })
    return
  }
  res.setHeader('Content-Type', avatar.mime)
  res.send(avatar.data)
}
