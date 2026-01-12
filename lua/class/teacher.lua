local Person = require('class.person')

local Teacher = Person:extend('Teacher')

function Teacher:ctor(name, age, subject)
  Teacher.super.ctor(self, name, age)
  self.subject = subject or '未定科目'
end

function Teacher:teach(topic)
  local lesson = topic or self.subject
  print(string.format('%s 正在讲授 %s。', self.name, lesson))
end

function Teacher:sayHi()
  Teacher.super.sayHi(self)
  print(string.format('我教授的科目是 %s。', self.subject))
end

return Teacher
