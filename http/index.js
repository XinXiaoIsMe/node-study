const http = require("node:http");
const url = require("node:url");
const fs = require("node:fs");

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);
  switch (pathname) {
    case "/":
      renderPage(res);
      break;
    case "/login":
      handleLogin(req, res);
      break;
    default:
      return404(res);
      break;
  }
});

server.listen(3000, () => {
  console.log("服务已启动，端口号：3000");
});

function renderPage(res) {
  const htmlStr = fs.readFileSync("./index.html", "utf8");
  res.setHeader("Content-type", "text/html");
  res.statusCode = 200;
  res.end(htmlStr);
}

function handleLogin(req, res) {
  let body = "";
  res.setHeader("Content-type", "application/json");
  res.statusCode = 200;
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    try {
      const { username, password } = JSON.parse(body);
      if (!username) {
        res.end(
          JSON.stringify({
            code: 200,
            status: false,
            msg: "没有设置用户名!",
          })
        );
        return;
      }

      if (!password) {
        res.end(
          JSON.stringify({
            status: false,
            code: 200,
            msg: "没有设置密码!",
          })
        );
        return;
      }

      res.end(JSON.stringify({
        code: 200,
        status: true,
        msg: "登录成功!",
        data: `${username}_${password}`
      }));
    } catch (err) {
      res.end(
        JSON.stringify({
          status: false,
          code: 200,
          msg: "请传入合法的参数!",
        })
      );
    }
  });
}

function return404(res) {
  res.statusCode = 404;
  res.setHeader("Content-type", "text/html");
  res.end(
    `
      <div>404</div>
    `
  );
}
