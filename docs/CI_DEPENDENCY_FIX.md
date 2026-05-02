# CI/CD 依赖安装错误修复

## 更新时间
2026年5月3日

## 问题描述
推送到远程仓库时，CI/CD 在 "Install dependencies" 步骤报错。

## 错误信息

```
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync.
npm error Missing: @swc/helpers@0.5.21 from lock file
```

## 根本原因

有两个问题：

### 问题 1: 多个 lockfile 导致混淆

项目目录结构存在问题：
```
language-learning/
├── package-lock.json          ❌ 多余的文件（没有对应的 package.json）
└── language-learning-app/
    ├── package.json           ✅ 项目配置
    └── package-lock.json      ✅ 依赖锁定文件
```

**问题**：
1. 父目录 `language-learning/` 有 `package-lock.json` 但没有 `package.json`
2. 这导致 Next.js 和 CI/CD 工具混淆，不知道使用哪个 lockfile
3. `npm ci` 命令在 CI 环境中可能找到错误的 lockfile 或找不到对应的 package.json

### 问题 2: package.json 和 package-lock.json 不同步

`package-lock.json` 中缺少 `@swc/helpers@0.5.21`，说明：
- `package.json` 的依赖已更新
- 但 `package-lock.json` 没有相应更新
- `npm ci` 严格要求两者完全同步

**构建警告**（本地）：
```
⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
 We detected multiple lockfiles and selected the directory of 
 C:\Users\13714\Desktop\language-learning\package-lock.json as the root directory.
```

## 解决方案

### 步骤 1: 删除多余的 package-lock.json

删除父目录中没有对应 package.json 的 lockfile：

```bash
# 在项目根目录执行
cd language-learning
rm package-lock.json
```

### 步骤 2: 重新生成 package-lock.json

确保 `package-lock.json` 与 `package.json` 完全同步：

```bash
cd language-learning-app

# 删除旧的依赖
rm -rf node_modules
rm package-lock.json

# 重新安装，生成新的 lockfile
npm install
```

**验证**：
```bash
cd language-learning-app
npm run build
```

应该不再看到关于多个 lockfiles 的警告。

### 步骤 3: 提交并推送

```bash
git add package-lock.json
git commit -m "fix: regenerate package-lock.json to sync with package.json"
git push
```

### 步骤 4: 更新 CI 配置（可选，但推荐）

为了明确指定 lockfile 位置，更新 `.github/workflows/ci.yml`：

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
    cache-dependency-path: 'package-lock.json'  # 明确指定 lockfile 路径
```

## 为什么会出现这些问题？

### 多个 lockfile 的原因：
1. 在父目录误执行了 `npm install`
2. 项目初始化时在错误的目录运行了 npm 命令
3. 从其他项目复制文件时带入了多余的 lockfile

### lockfile 不同步的原因：
1. 手动修改了 `package.json` 但没有运行 `npm install`
2. 使用了 `npm install --package-lock-only`（只更新 lockfile）
3. 依赖版本冲突导致 lockfile 损坏
4. node_modules 目录损坏或不完整

## 预防措施

### 1. 始终在正确的目录执行 npm 命令
```bash
cd language-learning-app  # 确保在项目目录
npm install
```

### 2. 使用正确的 npm 命令
- **开发环境**：使用 `npm install` 安装依赖
- **CI 环境**：使用 `npm ci` 确保一致性
- **更新依赖**：使用 `npm update` 而不是手动修改 package.json

### 3. 保持 lockfile 同步
每次修改 `package.json` 后：
```bash
npm install  # 自动更新 package-lock.json
git add package.json package-lock.json
git commit -m "chore: update dependencies"
```

### 4. 检查 .gitignore
   确保不会意外提交错误位置的依赖文件：
   ```gitignore
   # 在项目根目录的 .gitignore
   node_modules/
   # 不要忽略 package-lock.json！它应该被提交
   ```

### 5. 定期检查项目结构
   ```bash
   # 查找所有 package-lock.json
   find . -name "package-lock.json"
   
   # 应该只有一个：./language-learning-app/package-lock.json
   ```

### 6. 遇到依赖问题时的标准流程
```bash
# 1. 删除旧的依赖
rm -rf node_modules package-lock.json

# 2. 清理 npm 缓存（可选）
npm cache clean --force

# 3. 重新安装
npm install

# 4. 验证构建
npm run build

# 5. 提交更新
git add package-lock.json
git commit -m "fix: regenerate lockfile"
```

## CI/CD 最佳实践

### 使用 npm ci 而不是 npm install

CI 配置正确使用了 `npm ci`：
```yaml
- name: Install dependencies
  run: npm ci
```

**npm ci 的优势**：
- 更快（跳过某些用户导向的功能）
- 更可靠（严格按照 lockfile 安装）
- 更安全（如果 package.json 和 lockfile 不匹配会报错）

### 指定 Node.js 版本

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # 与本地开发环境一致
```

### 启用依赖缓存

```yaml
with:
  cache: 'npm'
  cache-dependency-path: 'package-lock.json'
```

这可以显著加快 CI 构建速度。

## 验证修复

### 本地验证
```bash
cd language-learning-app
npm run build
```

应该看到：
- ✅ 没有关于多个 lockfiles 的警告
- ✅ 构建成功

### CI 验证
推送代码到远程仓库：
```bash
git add .
git commit -m "fix: remove duplicate package-lock.json"
git push
```

检查 GitHub Actions：
- ✅ Install dependencies 步骤成功
- ✅ Type check 通过
- ✅ Linter 通过

## 相关文件

- `.github/workflows/ci.yml` - CI 配置
- `package.json` - 项目依赖配置
- `package-lock.json` - 依赖版本锁定

## 总结

**问题**：
1. 父目录有多余的 `package-lock.json` 导致 CI/CD 混淆
2. `package.json` 和 `package-lock.json` 不同步（缺少 `@swc/helpers@0.5.21`）

**解决**：
1. ✅ 删除父目录的 `package-lock.json`
2. ✅ 删除 `node_modules` 和旧的 `package-lock.json`
3. ✅ 运行 `npm install` 重新生成同步的 lockfile
4. ✅ 更新 CI 配置明确指定 lockfile 路径
5. ✅ 验证本地构建无警告
6. ✅ 提交并推送到远程
7. ✅ 验证 CI 通过

**关键点**：
- `npm ci` 要求 `package.json` 和 `package-lock.json` 完全同步
- 遇到依赖问题时，删除 `node_modules` 和 `package-lock.json` 重新安装是最可靠的方法
- 始终提交 `package-lock.json` 到版本控制（不要添加到 .gitignore）
