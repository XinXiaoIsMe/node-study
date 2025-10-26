import http from "node:http";
import url from "node:url";
import fs from "node:fs";
import yaml from "js-yaml";
import nodemailer from "nodemailer";
import { createHtmlPage } from "../http/server.js";

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url);
  if (pathname === "/send" && req.method === "POST") {
    // config.yaml中配置{ user: 邮箱地址, pass: 授权码 }
    const config = yaml.load(fs.readFileSync("./config.yaml"));
    const transport = nodemailer.createTransport({
      service: "qq",
      host: "smtp.qq.com",
      port: 587,
      secure: true,
      auth: config,
    });
    let data = "";
    res.setHeader("Content-Type", "application/json");

    req.on("data", (chunk) => {
      data += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const mailInfo = JSON.parse(data);
        await transport.sendMail({
          from: config.user,
          to: mailInfo.to,
          subject: mailInfo.subject,
          text: mailInfo.content,
        });
        res.end(
          JSON.stringify({
            status: true,
            code: 200,
            msg: "发送成功！",
          })
        );
      } catch (e) {
        res.end(
          JSON.stringify({
            status: false,
            code: 200,
            msg: e.message,
          })
        );
      }
    });
    return;
  }
  createHtmlPage("./index.html", res);
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
