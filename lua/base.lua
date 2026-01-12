local name = 'dog'

if name == 'cat' then
  print('猫')
elseif name == 'dog' then
  print('狗')
else
  print('猪')
end

function calculator(n1, n2, operator)
  if operator == '+' then
    return n1 + n2
  elseif operator == '-' then
    return n1 - n2
  elseif operator == '*' then
    return n1 * n2
  else
    return n1 / n2
  end
end

function addString(s1, s2) 
  return s1 .. s2
end

local n1 = 4
local n2 = 2
print(calculator(n1, n2, '+'))
print(calculator(n1, n2, '-'))
print(calculator(n1, n2, '*'))
print(calculator(n1, n2, '/'))

local s1 = 'hello, '
local s2 = 'world!'
print(addString(s1, s2))

-- table可以描述对象或者数组
-- 对象
local person = {
  name = 'zhangsan',
  age = 18,
  gender = 'male',
  isChinese = true
}

-- 数组，lua的数组下标从1开始
local hobbies = {
  'game',
  'watching movie'
}

print(person.name)
print(hobbies[1])

for i = 1, 10, 1 do -- 开始、结束、步长
  print(i) -- 输出1， 2， 3， 4， 5， 6， 7， 8, 9， 10
end

for key, value in pairs(person) do
  print(key, value)
end

for index, value in pairs(hobbies) do
  print(index, value)
end
