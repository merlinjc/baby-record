# 编码规范文档 - Baby Care Tracker

## 概述

本文档定义了 Baby Care Tracker 项目的编码规范，包括命名约定、代码组织、注释规范、错误处理、性能优化等方面。遵循这些规范可以确保代码质量、可读性和可维护性。

---

## 1. 命名约定

### 1.1 变量和函数命名

**规则：**
- 使用驼峰命名法（camelCase）
- 变量名应具有描述性，避免使用单个字符（除了循环变量）
- 函数名应使用动词开头，描述函数的行为

**示例：**
```javascript
// 好的命名
const babyProfileList = []
const currentUser = null
function getUserInfo() {}
function createBabyProfile() {}

// 不好的命名
const list = []  // 不够描述性
const u = null   // 单个字符，不清晰
function info() {} // 不是动词开头，不清楚行为
```

### 1.2 常量命名

**规则：**
- 使用大写字母和下划线（UPPER_SNAKE_CASE）
- 常量应在文件顶部定义

**示例：**
```javascript
const MAX_PHOTO_COUNT = 9
const DEFAULT_PAGE_SIZE = 20
const API_BASE_URL = 'https://...'
```

### 1.3 云函数命名

**规则：**
- 使用驼峰命名法（camelCase）
- 函数名应描述功能，使用动词+名词格式

**示例：**
```
checkAuthStatus
createBabyProfile
getBabyProfiles
uploadPhoto
getPhotos
getPhotoDetail
updatePhoto
deletePhoto
```

### 1.4 数据库集合命名

**规则：**
- 使用驼峰命名法（camelCase）
- 集合名应为复数形式

**示例：**
```
babyProfiles
photos
users
comments
likes
auditLogs
```

---

## 2. 代码组织

### 2.1 文件结构

**小程序页面文件结构：**
```
pages/pageName/
├── pageName.js     # 页面逻辑
├── pageName.json   # 页面配置
├── pageName.wxml   # 页面模板
└── pageName.wxss   # 页面样式
```

**云函数文件结构：**
```
cloudfunctions/functionName/
├── index.js        # 云函数入口
└── package.json    # 依赖配置
```

### 2.2 代码分层

项目采用分层架构：

```
小程序前端
├── 视图层（pages/）- 页面UI和交互
├── 服务层（services/）- 云函数调用封装
├── 工具层（utils/）- 通用工具函数
└── 模型层（models/）- 数据模型定义

CloudBase 云函数
├── 控制器层（index.js）- 请求处理和响应
├── 服务层（可拆分）- 业务逻辑
└── 数据访问层（直接使用 db）- 数据库操作
```

### 2.3 导入顺序

**规则：**
1. 先导入内置模块
2. 再导入第三方模块
3. 最后导入项目内部模块

**示例：**
```javascript
// 1. 内置模块（小程序框架）
const app = getApp()

// 2. 第三方模块（如有）
// const _ = require('lodash')

// 3. 项目内部模块
const cloudUtil = require('../../utils/cloudUtil')
const errorUtil = require('../../utils/errorUtil')
const babyService = require('../../services/babyService')
```

---

## 3. 注释规范

### 3.1 文件头部注释

**规则：**
- 每个文件开头应包含文件描述、作者、日期等信息

**示例：**
```javascript
// pages/index/index.js - 首页逻辑（使用CloudBase认证）
// 创建者：开发团队
// 创建日期：2026-05-21
// 功能描述：首页展示照片瀑布流和快速操作入口
```

### 3.2 函数注释

**规则：**
- 使用 JSDoc 格式注释函数
- 描述函数的功能、参数、返回值

**示例：**
```javascript
/**
 * 获取用户信息（从全局数据或调用云函数）
 * @param {string} userId - 用户ID
 * @returns {Promise} 用户信息
 */
const getUserInfo = async (userId) => {
  // ...
}
```

### 3.3 代码行注释

**规则：**
- 使用单行注释 `//` 解释复杂逻辑
- 注释应说明"为什么"而不是"是什么"

**示例：**
```javascript
// 使用 OPENID 作为用户标识，因为微信自动注入的身份是可信的
const { OPENID } = cloud.getWXContext()

// 如果用户不存在，创建新用户（首次登录）
if (!user) {
  // ...
}
```

---

## 4. 错误处理

### 4.1 云函数错误处理

**规则：**
- 使用 try-catch 包裹异步代码
- 返回统一的错误格式 `{ code: -1, message: '错误信息' }`

**示例：**
```javascript
exports.main = async (event, context) => {
  try {
    const { OPENID } = cloud.getWXContext()
    
    if (!OPENID) {
      return {
        code: -1,
        message: '获取用户身份失败'
      }
    }
    
    // 业务逻辑
    const result = await db.collection('users').where({
      _openid: OPENID
    }).get()
    
    return {
      code: 0,
      message: '操作成功',
      data: result
    }
  } catch (error) {
    console.error('云函数错误:', error)
    return {
      code: -1,
      message: '操作失败: ' + error.message
    }
  }
}
```

### 4.2 小程序端错误处理

**规则：**
- 使用 `errorUtil.handleCloudFunctionError()` 统一处理云函数错误
- 给用户友好的错误提示

**示例：**
```javascript
const getUserInfo = async () => {
  try {
    const result = await cloudUtil.callCloudFunction('getUserInfo')
    if (result.code === 0) {
      return result.data
    } else {
      throw new Error(result.message || '获取用户信息失败')
    }
  } catch (error) {
    errorUtil.handleCloudFunctionError(error, '获取用户信息失败')
    throw error
  }
}
```

### 4.3 错误提示规范

**规则：**
- 使用 `wx.showToast()` 显示错误提示
- 提示文字应简洁明了，说明问题和处理建议

**示例：**
```javascript
// 好的错误提示
wx.showToast({
  title: '网络错误，请检查网络后重试',
  icon: 'none'
})

// 不好的错误提示
wx.showToast({
  title: 'Error',
  icon: 'none'
})
```

---

## 5. 性能优化规范

### 5.1 避免重复调用

**规则：**
- 缓存常用数据（用户信息、宝宝档案等）
- 使用全局变量或本地存储缓存数据

**示例：**
```javascript
// 优先从全局数据获取
const getUserInfo = async () => {
  if (app.globalData.userInfo) {
    return app.globalData.userInfo
  }
  
  // 全局数据中没有，调用云函数获取
  const result = await cloudUtil.callCloudFunction('getUserInfo')
  // ...
}
```

### 5.2 分页加载

**规则：**
- 列表数据使用分页加载，避免一次加载过多数据
- 默认每页 20 条数据

**示例：**
```javascript
const getPhotos = async (page = 1, pageSize = 20) => {
  const result = await cloudUtil.callCloudFunction('getPhotos', {
    page,
    pageSize
  })
  // ...
}
```

### 5.3 图片优化

**规则：**
- 上传图片前压缩
- 使用缩略图展示，点击后加载原图

**示例：**
```javascript
// 上传前压缩图片
const compressImage = (filePath) => {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: filePath,
      quality: 80,
      success: (res) => resolve(res.tempFilePath),
      fail: (err) => reject(err)
    })
  })
}
```

---

## 6. UI 规范

### 6.1 颜色使用

**规则：**
- 使用 `app.wxss` 中定义的颜色变量
- 遵循美拉德色系设计

**颜色变量：**
```css
/* 主色调 */
.primary-color { color: #8B4513; }  /* 棕色 */
.primary-bg { background-color: #8B4513; }

/* 辅助色 */
.text-secondary { color: #795548; }
.text-muted { color: #A1887F; }
```

### 6.2 间距使用

**规则：**
- 使用 8rpx 网格系统
- 常用间距：24rpx（小）、32rpx（中）、48rpx（大）

**示例：**
```css
.container {
  padding: 24rpx;  /* 使用 8 的倍数 */
}

.card {
  margin-bottom: 24rpx;
}
```

### 6.3 字体大小

**规则：**
- 使用统一的字体大小层级

**字体大小：**
```css
.text-h1 { font-size: 40rpx; }  /* 大标题 */
.text-h2 { font-size: 36rpx; }  /* 中标题 */
.text-h3 { font-size: 32rpx; }  /* 小标题 */
.text-body1 { font-size: 28rpx; }  /* 正文 */
.text-body2 { font-size: 24rpx; }  /* 辅助文字 */
.text-caption { font-size: 20rpx; }  /* 说明文字 */
```

---

## 7. 安全规范

### 7.1 用户身份验证

**规则：**
- 云函数中通过 `cloud.getWXContext()` 获取用户身份
- 不要信任前端传递的用户 ID

**示例：**
```javascript
// 好的做法：从云函数上下文中获取用户身份
const { OPENID } = cloud.getWXContext()

// 不好的做法：信任前端传递的用户 ID
// const userId = event.userId  // 不安全！
```

### 7.2 数据库查询权限

**规则：**
- 使用数据库安全规则限制查询权限
- 在云函数中额外校验权限

**示例：**
```javascript
// 云函数中校验权限
const { OPENID } = cloud.getWXContext()

// 查询照片时，确保只能查询自己宝宝档案的照片
const photos = await db.collection('photos').where({
  babyId: event.babyId,
  _openid: OPENID  // 额外校验
}).get()
```

---

## 8. 测试规范

### 8.1 单元测试

**规则：**
- 对工具函数进行单元测试
- 使用 Jest 或类似框架

### 8.2 集成测试

**规则：**
- 对云函数 API 进行集成测试
- 使用微信开发者工具进行端到端测试

---

## 9. Git 提交规范

### 9.1 提交信息格式

**规则：**
- 使用约定式提交格式（Conventional Commits）
- 格式：`<type>(<scope>): <subject>`

**类型（type）：**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建工具、依赖管理等

**示例：**
```
feat(auth): 实现 CloudBase 微信小程序自动认证

- 移除登录页面
- 更新 app.js 使用异步检查登录状态
- 更新首页逻辑，移除登录页面跳转

Closes #123
```

---

## 10. 代码审查清单

提交代码前，请确保：

- [ ] 代码符合命名约定
- [ ] 代码有适当的注释
- [ ] 错误处理完整
- [ ] 没有硬编码的敏感信息（API 密钥等）
- [ ] 性能考虑（避免重复调用、分页加载等）
- [ ] UI 符合设计规范（颜色、间距、字体）
- [ ] 安全考虑（身份验证、权限校验）
- [ ] Git 提交信息符合规范

---

**文档版本**：v1.0  
**最后更新**：2026-05-21  
**维护者**：开发团队
