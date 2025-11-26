<!-- @format -->

# Google Apps Script 部署指南

## 401 Unauthorized 错误解决方案

如果遇到 **401 Unauthorized** 错误，这通常是因为 Google Apps Script 的 Web 应用部署配置不正确。

### 快速诊断

在浏览器中直接访问你的部署 URL（GET 请求）：

```
https://script.google.com/macros/s/AKfycbw1ZeMoiAMaqpZngmK3eFa5ovqCQW0Mt7ZxfAtDH9qthFzrC_qUmkRNRLurefzwCGRk/exec
```

**如果看到：**

- ✅ JSON 响应 `{"success":true,"message":"GET method not supported..."}` → 部署正常，问题可能在代码逻辑
- ❌ HTML 登录页面或 401 错误 → **部署配置错误**，需要按照下面的步骤修复
- ❌ 404 错误 → URL 不正确或部署已被删除

### ⚠️ 常见错误配置

**错误配置（会导致 401 错误）：**

- ❌ 执行身份：**"访问 Web 应用的用户"** (User accessing the Web App)
- ❌ 有访问权限的人员：**"拥有 Google 账号的任何用户"** (Any user with a Google account)

**正确配置：**

- ✅ 执行身份：**"我"** (Me - [你的邮箱地址])
- ✅ 有访问权限的人员：**"任何人"** (Anyone)

### 解决步骤

1. **打开 Google Apps Script 编辑器**

   - 访问 [script.google.com](https://script.google.com)
   - 打开你的脚本项目

2. **部署为 Web 应用**

   - 点击右上角的 "部署" (Deploy) 按钮
   - 选择 "新建部署" (New deployment)
   - 点击齿轮图标 ⚙️ 选择 "Web 应用" (Web app)

3. **配置部署设置**（非常重要！）

   - **说明** (Description): 可以填写 "Contact Form Handler" 或任何描述
   - **执行身份** (Execute as): 选择 **"我"** (Me - your email address)
   - **具有访问权限的用户** (Who has access): 选择 **"任何人"** (Anyone)
     - ⚠️ **重要**: 不要选择 "仅限拥有 Google 帐户的用户"，必须选择 "任何人"
   - 点击 "部署" (Deploy)

4. **授权访问**

   - 首次部署时，Google 会要求你授权
   - 点击 "授权访问" (Authorize access)
   - 选择你的 Google 账户
   - 点击 "高级" (Advanced) → "转到 [项目名称]（不安全）" (Go to [project name] (unsafe))
   - 点击 "允许" (Allow)

5. **复制新的部署 URL**

   - 部署成功后，复制新的 Web 应用 URL
   - 格式类似：`https://script.google.com/macros/s/AKfycb.../exec`
   - 更新 `config.ts` 中的 `googleAppsScriptUrl`

6. **更新配置**
   ```typescript
   // src/components/common/contactForm/config.ts
   export const DEFAULT_CONFIG: ContactFormConfig = {
     googleAppsScriptUrl: '你的新部署URL',
     sharedSecret: '你的共享密钥',
     autoResetDelay: 3000,
   };
   ```

### 常见问题

**Q: 为什么必须选择 "任何人"？**
A: 因为前端应用是公开访问的，如果限制为 "仅限拥有 Google 帐户的用户"，未登录用户将无法提交表单。

**Q: 部署后还是 401 错误？**
A:

这是最常见的问题，请按以下步骤逐一检查：

1. **检查部署设置**（最关键！）

   - 进入 Google Apps Script 编辑器
   - 点击右上角 "部署" → "管理部署" (Manage deployments)
   - 点击部署旁边的编辑图标（铅笔图标）
   - 确认以下设置：
     - ✅ **执行身份** (Execute as): **"我"** (Me - [你的邮箱])
     - ✅ **具有访问权限的用户** (Who has access): **"任何人"** (Anyone)
     - ❌ **不要选择** "仅限拥有 Google 帐户的用户" (Only myself 或 Only users in my organization)
   - 如果设置不正确，修改后点击 "部署" 保存

2. **重新部署**

   - 如果修改了设置，必须重新部署
   - 点击 "部署" → "管理部署"
   - 点击部署旁边的编辑图标
   - 点击 "部署" 按钮（即使设置没变，重新部署有时也能解决问题）

3. **检查授权状态**

   - 在 Google Apps Script 编辑器中，点击左侧菜单的 "执行" (Executions)
   - 查看是否有错误日志
   - 如果有权限错误，可能需要重新授权：
     - 点击 "部署" → "测试部署" (Test deployments)
     - 或者运行脚本中的测试函数

4. **验证部署 URL**

   - 在浏览器中直接访问部署 URL（GET 请求）
   - 应该看到 JSON 响应，而不是 HTML 错误页面
   - 如果看到 401 或登录页面，说明部署配置不正确

5. **清除缓存并重试**

   - 清除浏览器缓存
   - 使用无痕模式测试
   - 等待几分钟后重试（Google 的更改可能需要时间生效）

6. **检查脚本代码**
   - 确保 `doPost` 函数存在且正确
   - 确保没有语法错误
   - 在编辑器中运行测试函数验证脚本是否正常工作

**Q: 如何更新脚本代码？**
A:

- 修改代码后，需要创建新的部署版本
- 或者更新现有部署（点击部署旁边的编辑图标）
- 更新部署后，URL 保持不变（如果选择更新现有部署）

### 测试部署

部署完成后，可以在浏览器中直接访问部署 URL（GET 请求）来测试：

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

应该看到类似这样的 JSON 响应：

```json
{
  "success": true,
  "message": "GET method not supported. Please use POST."
}
```

这表示部署成功！

### 安全注意事项

- `sharedSecret` 用于验证请求来源，建议使用强随机字符串
- 虽然部署设置为 "任何人" 可访问，但通过 `sharedSecret` 可以防止未授权提交
- 定期检查 Google Sheets 中的提交记录，监控异常活动

---

## 邮件通知功能配置

表单提交后会自动发送两封邮件：

1. **确认邮件** - 发送给提交者，确认已收到信息
2. **通知邮件** - 发送给 `info@blueskycreations.com.au`，通知有新提交

### 邮件功能配置

在 `GoogleAppsScript.gs` 文件的配置区域，你可以修改以下设置：

```javascript
// ========== Email Configuration ==========
const EMAIL_ENABLED = true; // 设置为 false 可禁用邮件通知
const NOTIFICATION_EMAIL = 'info@blueskycreations.com.au'; // 接收通知的邮箱
const REPLY_TO_EMAIL = 'info@blueskycreations.com.au'; // 确认邮件的回复地址
const COMPANY_NAME = 'BlueSky Creations'; // 公司名称
```

### 使用 Google Apps Script MailApp（当前实现）

当前实现使用 Google Apps Script 的 `MailApp` 服务，它使用你的 Google 账户来发送邮件。

#### 配置步骤：

1. **确保 Google 账户有发送邮件权限**

   - 使用 Google Apps Script 的账户需要有发送邮件的权限
   - 如果使用 Google Workspace 账户，管理员需要启用邮件发送权限

2. **首次使用需要授权**

   - 首次运行脚本发送邮件时，Google 会要求授权
   - 点击 "授权访问" 并允许脚本发送邮件

3. **测试邮件功能**
   - 提交一个测试表单
   - 检查提交者邮箱是否收到确认邮件
   - 检查 `info@blueskycreations.com.au` 是否收到通知邮件

#### 邮件功能特点：

- ✅ **确认邮件**：自动发送给提交者，包含：

  - 感谢信息
  - 提交时间
  - 预计回复时间（24-48 小时）
  - 公司联系方式

- ✅ **通知邮件**：发送给公司邮箱，包含：
  - 提交 ID
  - 提交者姓名和邮箱
  - 问题类别
  - 提交的消息内容
  - **一键回复按钮**（点击可直接回复提交者）

#### 一键回复功能：

通知邮件中的 "Reply to [Name]" 按钮会：

- 自动打开邮件客户端
- 收件人设置为提交者的邮箱
- 主题自动填充为 "Re: [问题类别]"
- 点击即可直接回复，无需手动输入邮箱地址

### 使用 Office 365 邮箱（高级配置）

如果你需要使用 Office 365 邮箱（`notifications@ezeas.com`）来发送邮件，需要：

1. **使用 Microsoft Graph API**

   - 需要在 Azure AD 注册应用
   - 配置 OAuth 2.0 认证
   - 获取访问令牌
   - 使用 Graph API 发送邮件

2. **或者使用第三方服务**
   - 使用 SendGrid、Mailgun 等服务
   - 通过 API 发送邮件

**注意**：Google Apps Script 不能直接使用 SMTP 协议，所以不能直接使用你提供的 Office 365 SMTP 凭据。如果需要使用 Office 365，建议：

- 使用 Microsoft Graph API（需要额外配置）
- 或者继续使用 Google MailApp（更简单，推荐）

### 邮件发送错误处理

- 如果邮件发送失败，不会影响表单提交
- 数据仍会保存到 Google Sheets
- 错误会记录在 Google Apps Script 的执行日志中
- 可以在 Google Apps Script 编辑器的 "执行" 菜单中查看日志

### 禁用邮件功能

如果暂时不想发送邮件，可以在 `GoogleAppsScript.gs` 中设置：

```javascript
const EMAIL_ENABLED = false; // 禁用邮件通知
```

这样表单仍会正常工作，数据会保存到 Google Sheets，但不会发送邮件。
