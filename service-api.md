# 服务层 API 文档 - Baby Care Tracker

## 概述

本文档定义了 Baby Care Tracker 项目的服务层 API。服务层封装了 CloudBase 云函数调用，提供统一的接口供小程序前端使用。

**服务层结构：**
```
miniprogram/services/
├── userService.js      # 用户认证、资料同步
├── babyService.js      # 宝宝档案服务
├── familyService.js    # 家庭成员与邀请
└── photoService.js     # 照片服务
```

---

## 1. 用户服务（userService.js）

### 1.1 初始化并确保用户存在

**函数：** `ensureUser()`

**功能描述：** 调用 `checkAuthStatus` 云函数，基于 CloudBase 自动认证获取当前用户；若数据库中不存在用户记录，则自动创建。返回结果会同步到 `App.globalData.userInfo`。

**参数：** 无

**返回值：** `Promise<UserInfo>`

**示例：**
```javascript
const userInfo = await userService.ensureUser()
```

### 1.2 获取用户信息

**函数：** `getUserInfo()`

**功能描述：** 优先读取全局缓存中的用户信息；缓存缺失时回退到 `ensureUser()`。

**参数：** 无

**返回值：** `Promise<UserInfo>`

**示例：**
```javascript
const userInfo = await userService.getUserInfo()
```

**UserInfo 结构：**
```typescript
interface UserInfo {
  _id: string
  _openid: string
  appId: string
  nickName: string
  avatarUrl: string
  babyProfiles: string[]
  profileCompleted: boolean
  createTime: Date
  updateTime: Date
}
```

说明：`profileCompleted` 当前以“昵称已填写”为准，用于控制邀请等协作动作是否允许继续。

### 1.3 更新个人资料

**函数：** `updateUserProfile(payload: UpdateUserProfilePayload)`

**功能描述：** 更新昵称和头像地址，并同步刷新全局用户缓存。

**参数：**
- `payload.nickName: string` - 必填，去首尾空格后不能为空，最大 20 个字符
- `payload.avatarUrl: string` - 可选，仅允许 `https://` 地址，最大 2048 字符

**返回值：** `Promise<UserInfo>`

**示例：**
```javascript
const userInfo = await userService.updateUserProfile({
  nickName: 'Merlin 妈妈',
  avatarUrl: 'https://example.com/avatar.jpg'
})
```

**UpdateUserProfilePayload 结构：**
```typescript
interface UpdateUserProfilePayload {
  nickName: string
  avatarUrl?: string
}
```

### 1.4 当前登录态说明

当前小程序没有单独的“登录页”或显式登录 API。用户打开小程序后，CloudBase 会自动注入微信身份，业务侧通过 `checkAuthStatus` 完成“识别用户 + 补齐 users 记录”这一步。

---

## 2. 宝宝档案服务（babyService.js）

### 2.1 获取宝宝档案列表

**函数：** `getBabyProfiles()`

**功能描述：** 获取当前用户的宝宝档案列表

**参数：** 无

**返回值：** `Promise<BabyProfile[]>`

**示例：**
```javascript
const babyProfiles = await babyService.getBabyProfiles()
```

**BabyProfile 结构：**
```typescript
interface BabyProfile {
  _id: string
  name: string
  birthday: string
  gender: 'male' | 'female' | 'unknown'
  avatar?: string
  creatorId: string
  members: Member[]
  settings: Settings
  createTime: Date
  updateTime: Date
}

interface Member {
  userId: string
  role: 'creator' | 'admin' | 'member' | 'viewer'
  joinedAt: number
  nickname: string
}

interface Settings {
  allowDownload: boolean
  allowShare: boolean
  defaultPermission: 'public' | 'family' | 'private'
}
```

### 2.2 创建宝宝档案

**函数：** `createBabyProfile(data: CreateBabyProfileDto)`

**功能描述：** 创建新的宝宝档案

**参数：**
- `data: CreateBabyProfileDto` - 创建宝宝档案的数据

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await babyService.createBabyProfile({
  name: '小明',
  birthday: '2025-10-01',
  gender: 'male'
})
```

**CreateBabyProfileDto 结构：**
```typescript
interface CreateBabyProfileDto {
  name: string
  birthday: string
  gender: 'male' | 'female' | 'unknown'
  avatar?: string
}
```

### 2.3 更新宝宝档案

**函数：** `updateBabyProfile(id: string, data: UpdateBabyProfileDto)`

**功能描述：** 更新宝宝档案信息

**参数：**
- `id: string` - 宝宝档案ID
- `data: UpdateBabyProfileDto` - 更新数据

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await babyService.updateBabyProfile('bp_001', {
  name: '小明',
  birthday: '2025-10-01'
})
```

### 2.4 删除宝宝档案

**函数：** `deleteBabyProfile(id: string)`

**功能描述：** 删除宝宝档案

**参数：**
- `id: string` - 宝宝档案ID

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await babyService.deleteBabyProfile('bp_001')
```

### 2.5 设置当前宝宝

**函数：** `setCurrentBaby(babyProfile: BabyProfile)`

**功能描述：** 设置当前选中的宝宝档案

**参数：**
- `babyProfile: BabyProfile` - 宝宝档案对象

**返回值：** `void`

**示例：**
```javascript
babyService.setCurrentBaby(babyProfiles[0])
```

### 2.6 获取当前宝宝

**函数：** `getCurrentBaby()`

**功能描述：** 获取当前选中的宝宝档案

**参数：** 无

**返回值：** `BabyProfile | null`

**示例：**
```javascript
const currentBaby = babyService.getCurrentBaby()
```

---

## 3.1 家庭服务（familyService.js）

### 3.1.1 获取家庭成员

**函数：** `getFamilyMembers(babyId: string)`

**功能描述：** 获取当前宝宝档案的成员列表、当前用户角色和是否可管理成员。

### 3.1.2 创建邀请

**函数：** `inviteMember(payload: InviteMemberPayload)`

**功能描述：** 由创建者或管理员创建一次性邀请码邀请。创建前会校验当前用户是否已完成个人资料。

**参数：**
- `payload.babyId: string` - 宝宝档案 ID
- `payload.role: 'admin' | 'member' | 'viewer'` - 被邀请人角色
- `payload.relationship?: string` - 关系备注

**返回值：** `Promise<InviteResult>`

**说明：**
- `sharePath` 现在使用 `code` 参数，而不是长期有效的 `token`
- `inviteCode` 为 8 位一次性邀请码
- `isOneTime === true` 表示邀请码仅允许单次使用

### 3.1.3 接受邀请

**函数：** `acceptInvitation(inviteCode: string)`

**功能描述：** 使用一次性邀请码加入家庭。邀请码被使用后会立即失效；过期邀请码会被标记为 `expired`。

### 3.1.4 移除成员

**函数：** `removeMember(payload: RemoveMemberPayload)`

**功能描述：** 由创建者或管理员移除非创建者成员。

## 3. 照片服务（photoService.js）

### 3.1 上传照片

**函数：** `uploadPhoto(data: UploadPhotoDto)`

**功能描述：** 上传宝宝照片

**参数：**
- `data: UploadPhotoDto` - 上传照片的数据

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await photoService.uploadPhoto({
  babyId: 'bp_001',
  filePath: 'wxfile://...',
  description: '宝宝第一次微笑',
  location: {
    name: '北京市朝阳区',
    latitude: 39.9042,
    longitude: 116.4074
  }
})
```

**UploadPhotoDto 结构：**
```typescript
interface UploadPhotoDto {
  babyId: string
  filePath: string
  description?: string
  location?: Location
  permission?: 'public' | 'family' | 'private' | 'admin'
}

interface Location {
  name: string
  latitude: number
  longitude: number
}
```

### 3.2 获取照片列表

**函数：** `getPhotos(params: GetPhotosParams)`

**功能描述：** 获取照片列表（分页）

**参数：**
- `params: GetPhotosParams` - 查询参数

**返回值：** `Promise<PhotoListResult>`

**示例：**
```javascript
const result = await photoService.getPhotos({
  babyId: 'bp_001',
  page: 1,
  pageSize: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc'
})
```

**GetPhotosParams 结构：**
```typescript
interface GetPhotosParams {
  babyId: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  tags?: string[]
  startDate?: string
  endDate?: string
}
```

**PhotoListResult 结构：**
```typescript
interface PhotoListResult {
  list: Photo[]
  total: number
  page: number
  pageSize: number
}

interface Photo {
  _id: string
  babyId: string
  uploaderId: string
  fileId: string
  thumbnailId: string
  description: string
  location?: Location
  tags: string[]
  isFavorite: boolean
  permission: string
  auditStatus: string
  viewCount: number
  likeCount: number
  commentCount: number
  createdAt: Date
  updatedAt: Date
}
```

### 3.3 获取照片详情

**函数：** `getPhotoDetail(photoId: string)`

**功能描述：** 获取照片详情

**参数：**
- `photoId: string` - 照片ID

**返回值：** `Promise<Photo>`

**示例：**
```javascript
const photo = await photoService.getPhotoDetail('photo_001')
```

### 3.4 更新照片信息

**函数：** `updatePhoto(photoId: string, data: UpdatePhotoDto)`

**功能描述：** 更新照片信息（描述、标签等）

**参数：**
- `photoId: string` - 照片ID
- `data: UpdatePhotoDto` - 更新数据

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await photoService.updatePhoto('photo_001', {
  description: '更新后的描述',
  tags: ['微笑', '百天']
})
```

**UpdatePhotoDto 结构：**
```typescript
interface UpdatePhotoDto {
  description?: string
  tags?: string[]
  permission?: string
  isFavorite?: boolean
}
```

### 3.5 删除照片

**函数：** `deletePhoto(photoId: string)`

**功能描述：** 删除照片（移入回收站）

**参数：**
- `photoId: string` - 照片ID

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await photoService.deletePhoto('photo_001')
```

### 3.6 获取已删除照片

**函数：** `getDeletedPhotos(babyId: string)`

**功能描述：** 获取当前用户有恢复权限的已删除照片列表（回收站）

**参数：**
- `babyId: string` - 宝宝档案ID

**返回值：** `Promise<Photo[]>`

**示例：**
```javascript
const deletedPhotos = await photoService.getDeletedPhotos('bp_001')
```

### 3.7 恢复照片

**函数：** `restorePhoto(photoId: string)`

**功能描述：** 恢复已删除的照片

**参数：**
- `photoId: string` - 照片ID

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await photoService.restorePhoto('photo_001')
```

### 3.8 按时间获取照片

**函数：** `getPhotosByTime(params: GetPhotosByTimeParams)`

**功能描述：** 按年/月/日分组获取照片

**参数：**
- `params: GetPhotosByTimeParams` - 查询参数

**返回值：** `Promise<PhotoTimeGroupResult>`

**示例：**
```javascript
const result = await photoService.getPhotosByTime({
  babyId: 'bp_001',
  groupBy: 'month',
  year: 2026
})
```

**GetPhotosByTimeParams 结构：**
```typescript
interface GetPhotosByTimeParams {
  babyId: string
  groupBy: 'year' | 'month' | 'day'
  year?: number
  month?: number
}
```

**PhotoTimeGroupResult 结构：**
```typescript
interface PhotoTimeGroupResult {
  groups: PhotoTimeGroup[]
}

interface PhotoTimeGroup {
  key: string  // 年份或月份或日期
  count: number
  photos: Photo[]
}
```

---

## 4. 工具层 API（utils/）

### 4.1 云函数调用工具（cloudUtil.js）

#### 4.1.1 调用云函数

**函数：** `callCloudFunction(name: string, data?: object, showLoading?: boolean)`

**功能描述：** 调用 CloudBase 云函数

**参数：**
- `name: string` - 云函数名称
- `data: object` - 传递给云函数的数据（可选，默认 `{}`）
- `showLoading: boolean` - 是否显示加载提示（可选，默认 `true`）

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await cloudUtil.callCloudFunction('getUserInfo', {
  userId: 'user_001'
})
```

#### 4.1.2 静默调用云函数

**函数：** `callCloudFunctionSilent(name: string, data?: object)`

**功能描述：** 调用云函数（不显示加载提示）

**参数：**
- `name: string` - 云函数名称
- `data: object` - 传递给云函数的数据（可选，默认 `{}`）

**返回值：** `Promise<Result>`

**示例：**
```javascript
const result = await cloudUtil.callCloudFunctionSilent('getUserInfo')
```

#### 4.1.3 上传文件

**函数：** `uploadFile(filePath: string, cloudPath: string, onProgress?: function)`

**功能描述：** 上传文件到 CloudBase 存储

**参数：**
- `filePath: string` - 本地文件路径
- `cloudPath: string` - 云端文件路径
- `onProgress: function` - 进度回调函数（可选）

**返回值：** `Promise<UploadResult>`

**示例：**
```javascript
const result = await cloudUtil.uploadFile(
  'wxfile://temp/xxx.jpg',
  'baby_photos/bp_001/2026/05/photo_001.jpg',
  (progress) => console.log('上传进度:', progress)
)
```

#### 4.1.4 下载文件

**函数：** `downloadFile(fileID: string)`

**功能描述：** 下载 CloudBase 存储文件

**参数：**
- `fileID: string` - 云文件ID

**返回值：** `Promise<DownloadResult>`

**示例：**
```javascript
const result = await cloudUtil.downloadFile('cloudbase://...')
```

#### 4.1.5 获取临时文件 URL

**函数：** `getTempFileURL(fileID: string)`

**功能描述：** 获取云文件的临时访问 URL

**参数：**
- `fileID: string` - 云文件ID

**返回值：** `Promise<string>`

**示例：**
```javascript
const tempURL = await cloudUtil.getTempFileURL('cloudbase://...')
```

### 4.2 错误处理工具（errorUtil.js）

#### 4.2.1 处理云函数错误

**函数：** `handleCloudFunctionError(error: Error, defaultMessage?: string)`

**功能描述：** 统一处理云函数错误，显示用户友好的错误提示

**参数：**
- `error: Error` - 错误对象
- `defaultMessage: string` - 默认错误提示（可选）

**返回值：** `void`

**示例：**
```javascript
try {
  const result = await cloudUtil.callCloudFunction('getUserInfo')
} catch (error) {
  errorUtil.handleCloudFunctionError(error, '获取用户信息失败')
}
```

### 4.3 日期处理工具（dateUtil.js）

#### 4.3.1 格式化日期

**函数：** `formatDate(date: Date, format?: string)`

**功能描述：** 格式化日期为字符串

**参数：**
- `date: Date` - 日期对象
- `format: string` - 格式字符串（可选，默认 `'YYYY-MM-DD'`）

**返回值：** `string`

**示例：**
```javascript
const dateStr = dateUtil.formatDate(new Date(), 'YYYY-MM-DD')
// 输出: "2026-05-21"
```

#### 4.3.2 计算年龄

**函数：** `calculateAge(birthday: string)`

**功能描述：** 根据生日计算年龄（年月日）

**参数：**
- `birthday: string` - 生日字符串（格式：`'YYYY-MM-DD'`）

**返回值：** `string`

**示例：**
```javascript
const age = dateUtil.calculateAge('2025-10-01')
// 输出: "7个月20天"
```

### 4.4 文件处理工具（fileUtil.js）

#### 4.4.1 压缩图片

**函数：** `compressImage(filePath: string, quality?: number)`

**功能描述：** 压缩图片文件

**参数：**
- `filePath: string` - 图片文件路径
- `quality: number` - 压缩质量 0-100（可选，默认 `80`）

**返回值：** `Promise<string>` - 压缩后的文件路径

**示例：**
```javascript
const compressedPath = await fileUtil.compressImage('wxfile://temp/xxx.jpg', 80)
```

#### 4.4.2 生成云路径

**函数：** `generateCloudPath(babyId: string, photoId: string)`

**功能描述：** 生成云端存储路径

**参数：**
- `babyId: string` - 宝宝档案ID
- `photoId: string` - 照片ID

**返回值：** `string`

**示例：**
```javascript
const cloudPath = fileUtil.generateCloudPath('bp_001', 'photo_001')
// 输出: "baby_photos/bp_001/2026/05/photo_001.jpg"
```

---

## 5. 云函数 API

### 5.1 checkAuthStatus

**功能：** 检查用户认证状态，获取或创建用户信息

**输入：** 无（从云函数上下文中获取 OPENID）

**输出：**
```json
{
  "code": 0,
  "message": "获取用户信息成功",
  "data": {
    "_id": "user_001",
    "_openid": "oXXXX",
    "appId": "wxXXXX",
    "nickName": "",
    "avatarUrl": "",
    "babyProfiles": [],
    "profileCompleted": false,
    "createTime": "2026-05-21T10:00:00.000Z",
    "updateTime": "2026-05-21T10:00:00.000Z"
  }
}
```

### 5.1.1 updateUserProfile

**功能：** 更新当前用户的昵称和头像资料

**输入：**
```json
{
  "nickName": "Merlin 妈妈",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**输出：**
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "_id": "user_001",
    "_openid": "oXXXX",
    "nickName": "Merlin 妈妈",
    "avatarUrl": "https://example.com/avatar.jpg",
    "profileCompleted": true
  }
}
```

约束：昵称不能为空且最长 20 个字符；头像地址仅允许 `https://`。

### 5.1.2 inviteMember

**功能：** 创建一次性邀请码邀请

**输入：**
```json
{
  "babyId": "bp_001",
  "role": "member",
  "relationship": "奶奶"
}
```

**输出：**
```json
{
  "code": 0,
  "message": "邀请已创建",
  "data": {
    "inviteCode": "A1B2C3D4",
    "sharePath": "/pages/accept-invitation/accept-invitation?code=A1B2C3D4",
    "isOneTime": true
  }
}
```

说明：邀请码为一次性消费，成功加入后立即失效。

### 5.1.3 acceptInvitation

**功能：** 使用一次性邀请码加入家庭

**输入：**
```json
{
  "code": "A1B2C3D4"
}
```

**输出：**
```json
{
  "code": 0,
  "message": "已加入家庭",
  "data": {
    "babyId": "bp_001",
    "babyName": "小明",
    "role": "member",
    "inviteCode": "A1B2C3D4"
  }
}
```

说明：后端会在事务中完成邀请码状态更新、成员写入和用户可访问档案更新。

### 5.2 createBabyProfile

**功能：** 创建宝宝档案

**输入：**
```json
{
  "name": "小明",
  "birthday": "2025-10-01",
  "gender": "male",
  "avatar": "cloudbase://..."
}
```

**输出：**
```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "_id": "bp_001",
    "name": "小明",
    "birthday": "2025-10-01",
    "gender": "male",
    "creatorId": "user_001",
    "members": [...],
    "createTime": "2026-05-21T10:00:00.000Z",
    "updateTime": "2026-05-21T10:00:00.000Z"
  }
}
```

### 5.3 uploadPhoto

**功能：** 上传照片

**输入：**
```json
{
  "babyId": "bp_001",
  "filePath": "wxfile://...",
  "description": "宝宝第一次微笑",
  "location": {
    "name": "北京市朝阳区",
    "latitude": 39.9042,
    "longitude": 116.4074
  },
  "permission": "family"
}
```

**输出：**
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "_id": "photo_001",
    "babyId": "bp_001",
    "uploaderId": "user_001",
    "fileId": "cloudbase://...",
    "thumbnailId": "cloudbase://...",
    "description": "宝宝第一次微笑",
    "auditStatus": "pending",
    "createTime": "2026-05-21T10:00:00.000Z"
  }
}
```

---

**文档版本**：v1.0  
**最后更新**：2026-05-21  
**维护者**：开发团队
