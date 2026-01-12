package.path = package.path .. ';./lua/?.lua;./lua/?/?.lua'

local Person = require('class.person')
local Teacher = require('class.teacher')

local function assertTrue(condition, message)
  if not condition then
    error(message or '断言失败')
  end
end

local function assertEquals(actual, expected, message)
  if actual ~= expected then
    error(string.format('%s\n期望: %s\n得到: %s', message or '断言失败', tostring(expected), tostring(actual)))
  end
end

local function capturePrint(fn)
  local oldPrint = print
  local logs = {}
  print = function(...)
    local parts = {}
    local count = select('#', ...)
    for i = 1, count do
      parts[i] = tostring(select(i, ...))
    end
    table.insert(logs, table.concat(parts, '\t'))
  end
  fn()
  print = oldPrint
  return logs
end

local tests = {}

tests[#tests + 1] = {
  name = 'Teacher 构造与继承',
  fn = function()
    local teacher = Teacher('Lily', 28, 'Physics')
    assertEquals(teacher.name, 'Lily', '姓名赋值失败')
    assertEquals(teacher.age, 28, '年龄赋值失败')
    assertEquals(teacher.subject, 'Physics', '科目赋值失败')
    assertEquals(teacher:getProfile(), 'Lily(28)', 'Profile 输出错误')
    assertTrue(teacher:is(Person), 'Teacher 应该是 Person 的实例')
    assertTrue(teacher:is(Teacher), 'Teacher 实例类型判断失败')
  end
}

tests[#tests + 1] = {
  name = 'Teacher 输出',
  fn = function()
    local teacher = Teacher('Bob', 33, 'Chemistry')
    local logs = capturePrint(function()
      teacher:sayHi()
      teacher:teach('Organic')
    end)
    assertEquals(#logs, 3, '打印次数不符')
    assertTrue(logs[1]:find('Bob') ~= nil, '自我介绍缺少姓名')
    assertTrue(logs[2]:find('Chemistry') ~= nil, '自我介绍缺少科目')
    assertTrue(logs[3]:find('Organic') ~= nil, '讲课输出缺少主题')
  end
}

local passed = 0
for _, test in ipairs(tests) do
  test.fn()
  passed = passed + 1
  print(string.format('Test [%s] passed', test.name))
end

print(string.format('All %d tests passed', passed))
