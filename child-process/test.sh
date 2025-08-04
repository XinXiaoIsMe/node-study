#!/bin/bash

# 创建 test.js 文件
echo "console.log('hello world')" > test.js

# 输出提示
echo "已创建 test.js，内容如下："
cat test.js

# 执行 test.js
echo "执行结果："
node test.js
