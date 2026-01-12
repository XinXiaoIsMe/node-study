local Class = require('class.class')

local Person = Class('Person')

function Person:ctor(name, age)
  self.name = name or '未命名'
  self.age = age or 0
end

function Person:sayHi()
  print(string.format('大家好，我是 %s，今年 %d 岁。', self.name, self.age))
end

function Person:getProfile()
  return string.format('%s(%d)', self.name, self.age)
end

return Person
