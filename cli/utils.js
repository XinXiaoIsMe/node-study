import fs from "node:fs";
import downloadGitRepo from "download-git-repo";
import ora from "ora";

const spinner = ora("下载中...");

/**
 * 判断路径是否已经存在
 * @param {string} path 路径
 * @returns 路径是否存在
 */
export function checkPath(path) {
  return fs.existsSync(path);
}

// 获取脚手架版本
export function getVersion() {
  const packageJson = JSON.parse(fs.readFileSync("./package.json"));
  return packageJson.version;
}

// 模板
const repoMap = {
  "vue-ts": "direct:https://github.com/xx-template/vue-ts.git#main", // 需要以direct开头，#后面的是仓库分支名
  "react-ts": "direct:https://github.com/riipandi/vite-react-template.git#main",
};

/**
 * 下载git仓库到本地
 * @param {string} path 本地地址，用于存放仓库
 * @param {string} template 模板
 * @returns Promise
 */
export function downloadRepo(path, template) {
  return new Promise((resolve, reject) => {
    spinner.start();
    downloadGitRepo(repoMap[template], path, { clone: true }, (err) => {
      if (err) {
        reject(err);
        spinner.err("下载失败！");
        return;
      }
      resolve();
      spinner.succeed("下载完成！");
    });
  });
}
