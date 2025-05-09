#!/bin/bash
set -e

# 執行 HTTP 請求並提取 token
response=$(curl -s -X POST 'https://partner.mcpqa.xyz/v1/auth/signup-game' \
  -H 'X-Site-Code: mocp' \
  -H 'X-Mcp-Signature: zV9YnXZAldEdEjwISb0T9WUgLUWKAJYLh7d/OOAyerM=' \
  -H 'Content-Type: application/json' \
  -d '{"agent": "mocpdefault","username": "user303","nickname": "user303","game_code": "lobby"}')

ticket=$(echo "$response" | jq -r '.game_url' | sed 's|https://play.mcpqa.xyz/#/||')
echo $ticket

if [ "$ticket" = "null" ] || [ -z "$ticket" ]; then
  echo "Error: Failed to retrieve token."
  exit 1
fi

# 清除 VITE_MCP_PLAY_TICKET 的值
sed -i '' "s/^VITE_MCP_PLAY_TICKET=.*/VITE_MCP_PLAY_TICKET=/" .env

# 更新 .env 文件 VITE_MCP_PLAY_TICKET 的值
sed -i '' "s|^VITE_MCP_PLAY_TICKET=.*|VITE_MCP_PLAY_TICKET=$(printf '%s' "$ticket" | sed 's/[&/?]/\\&/g')|" .env || echo "VITE_MCP_PLAY_TICKET=$ticket" >> .env

echo "Token updated successfully in .env"