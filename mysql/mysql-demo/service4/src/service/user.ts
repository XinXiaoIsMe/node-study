import type { UserCreateInput } from '@db/models';
import type { AvatarInfoModel, CanUpdateUserProfileModel, CreateUserParamModel, GetUserModel, UpdatedUserProfileModel, UserAvatarInfo } from '@/domain/model';
import type { IUserRepository, IUserService } from '@/interface';
import { inject, injectable } from 'inversify';
import sharp from 'sharp';
import { BadRequestError, HttpError, UnauthorizedError } from '@/common/errors';
import { TYPES } from '@/container/types';
import { updatedUserProfileSelect, userAvatarInfoSelect, userProfileSelect } from '@/domain/model';
import { hashPassword, parseBase64Avatar, parseToken } from '@/utils';

// 最大图片尺寸
const MAX_BASE64_AVATAR_SIZE = 2 * 1024 * 1024;

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository) private readonly _userRepo: IUserRepository,
  ) {}

  async getCurrentUser(userId: number): Promise<GetUserModel> {
    const data = await this._userRepo.getUserById(userId, userProfileSelect);
    if (!data) {
      throw new HttpError(200, {
        message: '用户不存在！',
      });
    }

    const {
      id,
      username,
      nickname,
      gender,
      role,
      selfIntro,
      avatarMime,
      avatarSize,
      updateTime,
    } = data;

    return {
      userId: id,
      username,
      nickname,
      gender,
      role,
      selfIntro,
      avatarMime,
      avatarSize,
      updateTime,
    };
  }

  async updateUserProfile(profile: CanUpdateUserProfileModel): Promise<UpdatedUserProfileModel> {
    const { userId, ...userProfile } = profile;
    const data = await this._userRepo.updateUserById(userId, userProfile, updatedUserProfileSelect);
    if (!data) {
      throw new HttpError(200, {
        message: '用户不存在！',
      });
    }

    const {
      id,
      username,
      nickname,
      gender,
      role,
      selfIntro,
      updateTime,
    } = data;

    return {
      userId: id,
      username,
      nickname,
      gender,
      role,
      selfIntro,
      updateTime,
    };
  }

  async updateUserAvatar(userId: number, {
    file,
    size,
    mimetype,
  }: AvatarInfoModel): Promise<UpdatedUserProfileModel> {
    // 压缩图片
    const compressed = await sharp(file)
      .rotate()
      .resize(320, 320, { fit: 'inside' })
      .jpeg({ quality: 80 })
      .toBuffer();
    const data = await this._userRepo.updateUserById(userId, {
      avatar: new Uint8Array(compressed),
      avatarSize: size,
      avatarMime: mimetype,
    }, updatedUserProfileSelect);
    if (!data) {
      throw new HttpError(200, {
        message: '用户不存在！',
      });
    }

    const {
      id,
      username,
      nickname,
      gender,
      role,
      selfIntro,
      updateTime,
    } = data;

    return {
      userId: id,
      username,
      nickname,
      gender,
      role,
      selfIntro,
      updateTime,
    };
  }

  async getUserAvatar(token: string, id?: number): Promise<UserAvatarInfo> {
    const jwtInfo = parseToken(token);
    if (!jwtInfo) {
      throw new UnauthorizedError({
        message: '没有访问权限!',
      });
    }
    const userId: number = id ?? jwtInfo.userId;
    const data = await this._userRepo.getUserById(userId, userAvatarInfoSelect);
    if (!data) {
      throw new BadRequestError({
        message: '查询失败！',
      });
    }

    const { avatar, avatarMime } = data;
    if (!avatar || !avatarMime) {
      throw new BadRequestError({
        message: '查询失败！',
      });
    }

    return {
      avatar,
      avatarMime,
    };
  }

  async getUserList(): Promise<GetUserModel[]> {
    const users = await this._userRepo.getUserList(userProfileSelect);
    return users.map(user => ({
      userId: user.id,
      ...user,
    }));
  }

  async createUser(profile: CreateUserParamModel): Promise<GetUserModel> {
    const user = await this._userRepo.getUserByUsername(profile.username);
    if (user) {
      throw new HttpError(200, {
        message: '用户已存在！',
      });
    }

    const { avatar, ...otherProfile } = profile;
    const userProfile: UserCreateInput = otherProfile;
    // 对密码进行加密
    userProfile.password = hashPassword(userProfile.password);

    if (avatar) {
      const parsed = parseBase64Avatar(avatar);
      if (!parsed) {
        throw new BadRequestError({
          message: '图片解析失败！',
        });
      }

      const { data, size, mimeType } = parsed;
      if (size > MAX_BASE64_AVATAR_SIZE) {
        throw new HttpError(200, {
          message: '图片大小不能超过2MB',
        });
      }
      userProfile.avatar = data;
      userProfile.avatarMime = mimeType;
      userProfile.avatarSize = size;
    }

    const data = await this._userRepo.createUser(userProfile);
    if (!data) {
      throw new HttpError(200, {
        message: '创建用户失败！',
      });
    }

    const {
      id,
      username,
      nickname,
      gender,
      role,
      selfIntro,
      avatarMime,
      avatarSize,
      updateTime,
    } = data;

    return {
      userId: id,
      username,
      nickname,
      gender,
      role,
      selfIntro,
      avatarMime,
      avatarSize,
      updateTime,
    };
  }

  async deleteUser(userId: number): Promise<boolean> {
    const user = await this._userRepo.getUserById(userId);
    if (!user) {
      throw new HttpError(200, {
        message: '用户不存在！',
      });
    }

    const data = await this._userRepo.deleteUserById(userId);
    return !!data;
  }
}
