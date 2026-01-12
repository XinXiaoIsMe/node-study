-- KEYS和ARGV全局变量只能用在redis里面
local key = KEYS[1]
local expires = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local count = tonumber(redis.call('get', key) or '0')

if count > limit then
  return 0 -- 如果抽奖超出了limit次，则返回0，提示用户
else
  redis.call('incr', key) -- 递增redis中key对应的值，每次递增1
  redis.call('expire', key, expires) -- 设置key的过期时间
  return 1
end