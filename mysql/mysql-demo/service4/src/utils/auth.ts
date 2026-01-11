import { ROUTE_WHITELIST } from '@config/routes';

/**
 * 校验路径是否在白名单中
 * @param path 路径
 * @returns 校验结果
 */
export function isWhitelisted(path: string) {
  return ROUTE_WHITELIST.some((route) => {
    if (route.endsWith('/*')) {
      return path.startsWith(route.replace('/*', ''));
    }
    return path === route;
  });
}
