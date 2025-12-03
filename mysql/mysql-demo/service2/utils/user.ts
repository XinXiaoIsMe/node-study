export function normalizeGender (gender?: any) {
    const genderValue = Number(gender);
    if (!Number.isNaN(genderValue) && genderValue > 0) {
        return genderValue;
    }
    return null;
}

export function normalizeRole (role?: string) {
    return role === 'admin' ? 'admin' : 'user';
}

interface AvatarInfo {
    [key: string]: any;
    avatar_size: number | null;
    update_time: Date | null;
}

export function getAvatarUpdatedTime<T extends AvatarInfo> (user: T) {
    return user.avatar_size && user.update_time ? new Date(user.update_time).toISOString() : null;
}
