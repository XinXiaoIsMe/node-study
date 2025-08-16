#!/usr/bin/env node
// 1. 使用上述特殊注释，告诉操作系统，执行自定义命令(study-cli)的时候，使用node运行这个文件
// 2. 接着在package.json中设置bin字段，指定自定义命令的名字(study-cli)以及需要运行的文件路径(./index.js)
// 3. 最后在项目根目录运行npm link创建一个软链接
// 4. 运行study-cli，即可运行index.js文件

import { program } from "commander";
import { input, select } from "@inquirer/prompts";
import { getVersion, checkPath, downloadRepo } from "./utils.js";

const version = getVersion();

program
  .version(version)
  .command("create <project-name>")
  .action(async (projectName) => {
    const name = await input({
      message: "请输入项目名称", // 描述
      default: projectName, // 默认值
    });

    if (checkPath(name)) {
        console.log('文件夹已存在！');
        return;
    }

    const template = await select({
      message: "选择项目模板",
      choices: [
        {
          name: "vue-ts",
          value: "vue-ts",
          description: "Vue+TypeScript模板",
        },
        {
          name: "react-ts",
          value: "react-ts",
          description: "React+TypeScript模板",
        },
      ],
    });

    // 下载仓库到本地
    downloadRepo(name, template);
  });

// action中使用异步回调时，需要使用parseAsync而不是parse
program.parseAsync();
