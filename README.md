# NBA Tech Insights

基于 GitHub Agentic Workflows 与 DeepSeek API 的 NBA 篮球新闻洞察流水线。

项目从多个 NBA 篮球新闻 RSS 信号源抓取内容，完成热点聚类、深度洞察和 Markdown 报告生成，并可通过 GitHub Pages 展示最新报告。

## 工作流程

```text
RSS 信号源
  → 抓取与清洗
  → DeepSeek 热点聚类
  → DeepSeek 洞察生成
  → Markdown 报告
  → Pull Request
  → GitHub Pages
```

AI 模型使用 `deepseek-v4-flash`。工作流通过 gh-aw 的 BYOK （Bring Your Own Key 自带密钥）配置调用 DeepSeek OpenAI 兼容接口，不要求 GitHub Copilot 订阅。

## 项目结构

```text
.
├── .github/workflows/
│   ├── tech-insight.md          # gh-aw 工作流源文件
│   ├── tech-insight.lock.yml    # 编译后的 GitHub Actions 工作流
│   └── deploy-pages.yml         # GitHub Pages 部署
└── Lab-01-Tech-Insights/
    ├── input/api/               # RSS 数据源配置
    ├── mcp-scripts/             # 抓取、聚类、洞察与报告工具
    ├── output/                  # 流水线输出
    ├── frontend/                # 报告展示页面（支持深色/浅色模式）
    ├── run_local_pipeline.py    # 本地 fallback 诊断脚本
    └── README.md                # 完整实验教程
```

## 环境要求

- GitHub 账号
- DeepSeek API Key，且账号具有可用余额
- GitHub CLI `gh`
- gh-aw 扩展
- Python 3.10+

安装并检查 gh-aw：

```bash
gh extension install github/gh-aw
gh aw --version
```

## 配置 DeepSeek API Key

在 GitHub 仓库的 **Settings → Secrets and variables → Actions** 中添加 Repository Secret：

```text
Name:  DEEPSEEK_API_KEY
Value: 你的 DeepSeek API Key
```

也可以通过 GitHub CLI 设置：

```bash
gh secret set DEEPSEEK_API_KEY
```

不要将真实 API Key 写入代码、`.env.example` 或任何 Git 提交。

## 允许 Actions 自动创建 Pull Request

NBA Insight 工作流通过 safe-outputs 自动创建报告 PR。首次运行前，需要在仓库中开启对应权限：

1. 打开仓库的 **Settings**。
2. 选择 **Actions → General**。
3. 滚动到 **Workflow permissions**。
4. 勾选 **Allow GitHub Actions to create and approve pull requests**。
5. 点击 **Save**。

也可以通过 GitHub CLI 设置：

```bash
gh api \
  --method PUT \
  repos/OWNER/REPO/actions/permissions/workflow \
  -f default_workflow_permissions=read \
  -F can_approve_pull_request_reviews=true
```

将 `OWNER/REPO` 替换为实际仓库，例如 `MetaHuman/info-insights`。验证设置：

```bash
gh api repos/OWNER/REPO/actions/permissions/workflow
```

返回结果中的 `can_approve_pull_request_reviews` 应为 `true`。如果网页选项不可用，说明该设置受组织或企业级 Actions 策略限制，需要由上级管理员开启。

## 编译和运行工作流

在仓库根目录执行：

```bash
gh aw compile .github/workflows/tech-insight.md
gh workflow run "NBA Insight Workflow"
```

也可以进入 GitHub 仓库的 **Actions** 页面，选择 **NBA Insight Workflow** 后手动运行。

工作流完成后会创建包含最新报告的 Pull Request。主要输出包括：

- `Lab-01-Tech-Insights/output/raw_signals.json`
- `Lab-01-Tech-Insights/output/clusters/hotspots.json`
- `Lab-01-Tech-Insights/output/insights/insights.json`
- `Lab-01-Tech-Insights/output/report.md`
- `Lab-01-Tech-Insights/frontend/report.md`

## 本地诊断

本地脚本不调用 DeepSeek，而是使用确定性 fallback 验证 Python 工具链：

```bash
python Lab-01-Tech-Insights/run_local_pipeline.py
```

预览前端报告：

```bash
python -m http.server 8000 --directory Lab-01-Tech-Insights/frontend
```

然后访问 `http://localhost:8000`。

## 深色/浅色模式

前端页面支持深色与浅色模式切换：
- 首次访问时自动跟随系统主题偏好（`prefers-color-scheme`）
- 点击页面右上角按钮可手动切换 🌙/☀️
- 选择会被保存在浏览器本地存储中

## 更多说明

完整实验步骤、工作流阶段与故障排查请参阅 [Lab-01-Tech-Insights/README.md](Lab-01-Tech-Insights/README.md)。
