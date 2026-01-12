package.path = package.path .. ';./lua/?.lua'
local calculator = require('calculator')

print(calculator('+', 2, 3))
