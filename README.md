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
├── compose.yaml   # Docker Compose 编排（对外 7788）
├── Dockerfile     # 静态站点镜像（nginx:1.27-alpine）
├── nginx.conf     # 静态站点配置（含安全响应头）
├── install.sh     # 一键部署入口（转调 deploy/install.sh）
├── deploy/
│   └── install.sh # 实际部署逻辑：装 Docker、建 .env、compose up --build
├── .env.example   # 环境变量示例（复制为 .env 使用）
├── .gitignore
└── README.md
```

## 部署

服务内外统一使用 `7788` 端口。部署成功后访问：

```text
http://服务器IP:7788
```

### 步骤 1：安装 Docker

```sh
curl -fsSL https://get.docker.com | sh
```

### 步骤 2：安装 SSH Key Studio

> Docker Compose 方法

```sh
git clone https://github.com/beiwang02/ssh-key-studio.git
cd ssh-key-studio
cp .env.example .env
docker compose up -d --build
```

- 服务端口：**7788**（改 `.env` 里的 `SSH_STUDIO_HOST_PORT` 可换）
- 常用命令：`docker compose ps` 查看状态，`docker compose logs -f ssh-key-studio` 查看日志
- 建议用本仓库的 GitHub Pages HTTPS 版本访问页面：<https://beiwang02.github.io/ssh-key-studio/>

> 自动化脚本方式（不想手动敲命令时）

```sh
git clone https://github.com/beiwang02/ssh-key-studio.git
cd ssh-key-studio
sudo bash install.sh
```

脚本会把代码部署到 `/opt/stacks/ssh-key-studio/`，自动创建 `.env` 并启动服务（未装 Docker 会自动安装；改 `APP_DIR` 环境变量可换目录）。

## 许可证

项目代码采用 [MIT License](LICENSE)。内联的 TweetNaCl、JSZip 等第三方组件保留各自许可，见 [`vendor/licenses/`](vendor/licenses/)。

## 自动检查

计划启用 GitHub Actions（当前凭据缺少 workflow 权限，工作流尚未上传），届时在 push 和 pull request 时执行：网页 JavaScript 语法/基础回归、部署脚本 Bash/ShellCheck 检查、Docker 镜像构建。

本地运行：

```bash
node tests/smoke.cjs
bash -n install.sh deploy/install.sh
shellcheck install.sh deploy/install.sh
```

CI 是自动检查，不是自动部署，也不等于真机浏览器验收。
