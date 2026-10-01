# SSH Key Studio

单文件、离线可用的 SSH 密钥工具：本地生成 Ed25519 / RSA 密钥、导入成对文件或 ZIP、复制公钥安装命令，并导出密钥文件。

- 网页入口：`index.html`
- 独立部署端口：`7788`
- 私钥会明文保存在**当前浏览器本地存储**。请勿在公用设备使用，建议下载离线备份后清理网页记录。
- 可选的 `sshpass` 密码拼接会把密码写入命令文本、剪贴板和终端历史；不建议长期使用，完成安装后应立即清空。
- 浏览器 WebCrypto 在非 localhost 的 HTTP 页面通常不可用。建议使用 GitHub Pages 的 HTTPS 页面。
- 不含分析、远程字体和网络 API 调用；静态页面及加密/ZIP 库已内联。

本项目仅提供静态网页，不提供服务器 SSH 登录接口。

## 仓库结构

```
ssh-key-studio/
├── index.html     # 网页本体（单文件，加密/ZIP 库已内联）
├── compose.yml    # Docker Compose 编排（对外 7788）
├── nginx.conf     # 静态站点配置（含安全响应头）
├── deploy.sh      # 一键部署脚本
└── README.md
```

## 一键部署

在目标服务器上执行（需已装 Docker + Compose）：

```bash
curl -fsSL -o deploy.sh https://raw.githubusercontent.com/beiwang02/ssh-key-studio/main/deploy.sh
sh deploy.sh
```

或手动：

```bash
git clone https://github.com/beiwang02/ssh-key-studio.git
cd ssh-key-studio          # 注意：先进入仓库目录
docker compose up -d
```

- 脚本固定把代码部署到 **`/opt/stacks/ssh-key-studio/`**（可改脚本顶部 `APP_DIR`）
- 部署后编排文件位置：`/opt/stacks/ssh-key-studio/compose.yml`
- 服务端口：**7788**，公网访问 `http://<服务器IP>:7788/`
- 建议用本仓库的 GitHub Pages HTTPS 版本访问页面：<https://beiwang02.github.io/ssh-key-studio/>
