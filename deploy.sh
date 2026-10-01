#!/bin/sh
# SSH Key Studio 一键部署脚本（GitHub 仓库自带）
# 用法：sh deploy.sh  （在服务器上执行，需已装 Docker + Compose）
# 部署目录固定为 /opt/stacks/ssh-key-studio，服务对外端口 7788
set -e

APP_DIR=/opt/stacks/ssh-key-studio
REPO=https://github.com/beiwang02/ssh-key-studio.git

echo "==> 目标目录: $APP_DIR"

if [ -d "$APP_DIR/.git" ]; then
  echo "==> 目录已存在（git 克隆），拉取最新代码"
  git -C "$APP_DIR" pull --ff-only
elif [ -d "$APP_DIR" ]; then
  echo "==> 目录已存在（非 git），直接使用现有编排文件"
else
  echo "==> 首次部署，克隆仓库"
  mkdir -p "$(dirname "$APP_DIR")"
  git clone "$REPO" "$APP_DIR"
fi

if [ ! -f "$APP_DIR/compose.yml" ]; then
  echo "错误：$APP_DIR 下没有 compose.yml，目录可能不对" >&2
  exit 1
fi

echo "==> 启动服务（端口 7788）"
docker compose -f "$APP_DIR/compose.yml" up -d

echo "==> 容器状态"
docker compose -f "$APP_DIR/compose.yml" ps

echo "==> 本地验证"
curl -sf -o /dev/null -w "http://127.0.0.1:7788/ -> HTTP %{http_code}\n" http://127.0.0.1:7788/ || echo "（本地验证未返回 200，请检查防火墙）"
echo "完成。公网地址: http://<服务器IP>:7788/"
