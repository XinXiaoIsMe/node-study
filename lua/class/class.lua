-- 基于元表的 Class 工具，企业项目常用写法
local function Class(name, super)
  local cls = {}
  cls.__name = name or 'UnnamedClass'
  cls.__index = cls
  cls.super = super

  -- 允许子类访问父类成员，同时把类当作函数直接调用构造器
  local classMt = {
    __call = function(_, ...)
      return cls:new(...)
    end
  }
  if super then
    classMt.__index = super
  end
  setmetatable(cls, classMt)

  function cls:new(...)
    local instance = setmetatable({}, cls)
    if instance.ctor then
      instance:ctor(...)
    end
    return instance
  end

  function cls:extend(childName)
    return Class(childName, cls)
  end

  -- 判断实例或类是否属于 target 类（含父类链）
  function cls:is(target)
    local current = getmetatable(self) or self
    while current do
      if current == target then
        return true
      end
      current = current.super
    end
    return false
  end

  cls.__tostring = function()
    return string.format('<%s instance>', cls.__name)
  end

  return cls
end

return Class
