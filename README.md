# SSH Key Studio

单文件、离线可用的 SSH 密钥工具：本地生成 Ed25519 / RSA 密钥、导入成对文件或 ZIP、复制公钥安装命令，并导出密钥文件。

- 网页入口：`index.html`
- 独立部署端口：`7788`
- 私钥会明文保存在**当前浏览器本地存储**。请勿在公用设备使用，建议下载离线备份后清理网页记录。
- 公钥安装只提供已登录服务器终端写入 `authorized_keys` 的命令，不收集服务器密码。
- 操作顺序：先在已登录的服务器终端安装公钥 → 保存连接配置 → 点击该记录的「验证登录」。每条记录只保留独立验证入口、导出文档和删除操作。
- 验证入口展开紧凑的**真实私钥路径**输入：示例仅为占位提示，不自动填入；填写前不能复制命令。请先下载私钥并放入实际 SSH 终端可读的位置，再输入该终端中的路径（支持 `~/`、绝对或相对路径）。网页保存密钥不等于终端已有文件；iOS Files/iCloud 的私钥须先导入实际 SSH 终端，不能直接视作可用于 `-i` 的路径。
- 网页只生成并复制验证命令，不执行 SSH，也不保存该路径或覆盖连接配置。命令使用记录地址、端口和用户名，忽略 SSH 配置/agent，仅允许指定私钥的公钥认证，禁止密码与键盘交互回退，并先设置文件权限为 `600`；目前生成私钥未加密。
- 首次验证可直接在终端核对并确认服务器主机指纹（`StrictHostKeyChecking=ask`）；不自动信任未知服务器、不关闭主机校验，无须另走普通连接入口。指纹应通过可信渠道核对，变化时不要盲目接受。
- 支持 HTTP、HTTPS 与本地文件：HTTP 下也支持 Ed25519/RSA 生成、私钥导入和指纹计算；随机数仍来自浏览器安全随机源。
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

默认访问端口为 `7788`（可修改 `.env` 中的 `SSH_STUDIO_HOST_PORT`）。部署成功后访问：

```text
http://服务器IP:7788
```

### 步骤 1：安装 Docker

已安装 Docker 和 Compose 的服务器可跳过这一步。

```bash
curl -fsSL https://get.docker.com | sh
```

### 步骤 2：Docker Compose 部署

> Docker Compose 方法

以下命令在服务器的 root 终端执行，部署目录固定为 `/opt/stacks/ssh-key-studio/`。

```bash
mkdir -p /opt/stacks
git clone https://github.com/beiwang02/ssh-key-studio.git /opt/stacks/ssh-key-studio
cd /opt/stacks/ssh-key-studio
cp .env.example .env
docker compose up -d --build
```

常用命令（先进入部署目录）：

```bash
cd /opt/stacks/ssh-key-studio
# 查看状态
docker compose ps
# 查看日志
docker compose logs -f ssh-key-studio
# 更新版本
git pull --ff-only
docker compose up -d --build
```

> 自动化脚本方式（备选，不想手动执行以上步骤时）

```bash
mkdir -p /opt/stacks
git clone https://github.com/beiwang02/ssh-key-studio.git /opt/stacks/ssh-key-studio
cd /opt/stacks/ssh-key-studio
sudo bash install.sh
```

脚本自动检查并安装 Docker、保留已有 `.env`，然后构建启动服务。两种方式的编排文件位置一致：`/opt/stacks/ssh-key-studio/compose.yaml`。

> HTTP 下也能生成 Ed25519、导入支持的密钥和计算指纹，但 HTTP 页面可能在传输中被篡改；处理私钥和密码时仍建议 HTTPS 或可信离线文件。

## 许可证

项目代码采用 [MIT License](LICENSE)。内联的 TweetNaCl、JSZip、Forge 等第三方组件保留各自许可，见 [`vendor/licenses/`](vendor/licenses/)。
