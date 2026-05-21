const mockStore = require('../utils/mockStore')
const cloudUtil = require('../utils/cloudUtil')
const userService = require('./userService')

const CURRENT_BABY_KEY = 'baby-photo-record-current-baby-id'

function getAppInstance() {
  return typeof getApp === 'function' ? getApp() : null
}

function buildProfileCompleted(userInfo) {
  return !!(userInfo && String(userInfo.nickName || '').trim())
}

function normalizeInviteCode(code) {
  return String(code || '').trim().toUpperCase()
}

function generateLocalInviteCode() {
  return Math.random().toString(16).slice(2, 10).toUpperCase().padEnd(8, '0')
}

function createUniqueLocalInviteCode(invitations) {
  let inviteCode = ''

  do {
    inviteCode = generateLocalInviteCode()
  } while ((invitations || []).some((item) => item.inviteCode === inviteCode && item.status === 'pending'))

  return inviteCode
}

function syncAppUserBabyProfiles(babyId) {
  if (!babyId) {
    return
  }

  const app = getAppInstance()
  const userInfo = app && app.globalData ? app.globalData.userInfo : null

  if (!userInfo) {
    return
  }

  const babyProfiles = Array.isArray(userInfo.babyProfiles) ? userInfo.babyProfiles : []

  if (babyProfiles.indexOf(babyId) >= 0) {
    return
  }

  const nextUserInfo = {
    ...userInfo,
    babyProfiles: babyProfiles.concat(babyId)
  }

  if (app && typeof app.setUserInfo === 'function') {
    app.setUserInfo(nextUserInfo)
    return
  }

  app.globalData.userInfo = nextUserInfo
}

async function ensureProfileCompleted() {
  const userInfo = await userService.getUserInfo()

  if (!userInfo || !userInfo.profileCompleted) {
    throw new Error('请先完善个人资料后再进行分享')
  }
}

function getLocalMemberRole(baby, openid) {
  if (!baby || !openid) {
    return ''
  }

  const member = (baby.members || []).find((item) => item.userId === openid)
  return member ? (member.role || 'member') : ''
}

function canManageLocalBaby(baby, openid) {
  const role = getLocalMemberRole(baby, openid)
  return role === 'creator' || role === 'admin'
}

function getRoleLabel(role) {
  if (role === 'creator') {
    return '创建者'
  }

  if (role === 'admin') {
    return '管理员'
  }

  if (role === 'member') {
    return '普通成员'
  }

  if (role === 'viewer') {
    return '仅查看者'
  }

  return '未加入'
}

function normalizeLocalRole(role) {
  const safeRole = role || 'member'

  if (['admin', 'member', 'viewer'].indexOf(safeRole) < 0) {
    throw new Error('成员角色不合法')
  }

  return safeRole
}

async function getFamilyMembers(babyId) {
  if (cloudUtil.isCloudReady()) {
    const result = await cloudUtil.callCloudFunction({
      name: 'getFamilyMembers',
      data: { babyId }
    })

    if (result && result.code === 0) {
      syncAppUserBabyProfiles(result.data && result.data.babyId)
      return result.data
    }

    throw new Error(result && result.message ? result.message : '获取家庭成员失败')
  }

  const db = mockStore.getDb()
  const baby = (db.babies || []).find((item) => item._id === babyId)

  if (!baby) {
    throw new Error('宝宝档案不存在')
  }

  const currentRole = getLocalMemberRole(baby, db.user._openid)
  const canManage = canManageLocalBaby(baby, db.user._openid)

  return {
    babyId: baby._id,
    babyName: baby.name,
    currentRole,
    currentRoleLabel: getRoleLabel(currentRole),
    canManage,
    members: (baby.members || []).map((member) => ({
      ...member,
      roleLabel: getRoleLabel(member.role),
      isSelf: member.userId === db.user._openid,
      canRemove: canManage && member.role !== 'creator' && member.userId !== db.user._openid
    }))
  }
}

async function inviteMember(payload) {
  if (cloudUtil.isCloudReady()) {
    await ensureProfileCompleted()

    const result = await cloudUtil.callCloudFunction({
      name: 'inviteMember',
      data: payload
    })

    if (result && result.code === 0) {
      return result.data
    }

    throw new Error(result && result.message ? result.message : '创建邀请失败')
  }

  const db = mockStore.getDb()
  const baby = (db.babies || []).find((item) => item._id === payload.babyId)

  if (!baby) {
    throw new Error('宝宝档案不存在')
  }

  if (!buildProfileCompleted(db.user)) {
    throw new Error('请先完善个人资料后再进行分享')
  }

  if (!canManageLocalBaby(baby, db.user._openid)) {
    throw new Error('无权邀请成员')
  }

  const safeRole = normalizeLocalRole(payload.role)
  const token = mockStore.createId('invite')
  const inviteCode = createUniqueLocalInviteCode(db.invitations || [])
  const now = new Date().toISOString()
  const invite = {
    _id: token,
    token,
    inviteCode,
    babyId: payload.babyId,
    role: safeRole,
    relationship: payload.relationship || '',
    status: 'pending',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createTime: now,
    updateTime: now
  }

  mockStore.updateDb((currentDb) => ({
    ...currentDb,
    invitations: [invite].concat(currentDb.invitations || [])
  }))

  return {
    ...invite,
    sharePath: '/pages/accept-invitation/accept-invitation?code=' + inviteCode,
    isOneTime: true
  }
}

async function acceptInvitation(input) {
  const inviteCode = normalizeInviteCode(input)

  if (cloudUtil.isCloudReady()) {
    const result = await cloudUtil.callCloudFunction({
      name: 'acceptInvitation',
      data: { code: inviteCode }
    })

    if (result && result.code === 0) {
      syncAppUserBabyProfiles(result.data && result.data.babyId)
      wx.setStorageSync(CURRENT_BABY_KEY, result.data && result.data.babyId ? result.data.babyId : '')
      return result.data
    }

    throw new Error(result && result.message ? result.message : '接受邀请失败')
  }

  const db = mockStore.getDb()
  const invitation = (db.invitations || []).find((item) => item.inviteCode === inviteCode && item.status === 'pending')

  if (!invitation) {
    throw new Error('邀请码不存在、已失效或已被使用')
  }

  if (new Date(invitation.expiresAt).getTime() < Date.now()) {
    mockStore.updateDb((currentDb) => ({
      ...currentDb,
      invitations: (currentDb.invitations || []).map((item) => item._id === invitation._id ? {
        ...item,
        status: 'expired',
        updateTime: new Date().toISOString()
      } : item)
    }))
    throw new Error('邀请码已过期')
  }

  const safeRole = normalizeLocalRole(invitation.role)

  const nextDb = mockStore.updateDb((currentDb) => ({
    ...currentDb,
    user: {
      ...currentDb.user,
      babyProfiles: currentDb.user.babyProfiles.includes(invitation.babyId)
        ? currentDb.user.babyProfiles
        : currentDb.user.babyProfiles.concat(invitation.babyId)
    },
    babies: currentDb.babies.map((baby) => baby._id === invitation.babyId ? {
      ...baby,
      members: (baby.members || []).some((member) => member.userId === currentDb.user._openid)
        ? baby.members
        : (baby.members || []).concat({
          userId: currentDb.user._openid,
          role: safeRole,
          relationship: invitation.relationship,
          joinTime: new Date().toISOString()
        })
    } : baby),
    invitations: (currentDb.invitations || []).map((item) => item._id === invitation._id ? {
      ...item,
      status: 'accepted',
      acceptedBy: currentDb.user._openid,
      acceptedTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    } : item)
  }))

  syncAppUserBabyProfiles(invitation.babyId)
  wx.setStorageSync(CURRENT_BABY_KEY, invitation.babyId)

  return {
    babyId: invitation.babyId,
    role: safeRole,
    babyName: ((nextDb.babies || []).find((item) => item._id === invitation.babyId) || {}).name || '',
    inviteCode
  }
}

async function removeMember(payload) {
  if (cloudUtil.isCloudReady()) {
    const result = await cloudUtil.callCloudFunction({
      name: 'removeMember',
      data: payload
    })

    if (result && result.code === 0) {
      return result
    }

    throw new Error(result && result.message ? result.message : '移除成员失败')
  }

  const db = mockStore.getDb()
  const baby = (db.babies || []).find((item) => item._id === payload.babyId)

  if (!baby) {
    throw new Error('宝宝档案不存在')
  }

  if (!canManageLocalBaby(baby, db.user._openid)) {
    throw new Error('无权移除成员')
  }

  const member = (baby.members || []).find((item) => item.userId === payload.userId)

  if (!member || member.role === 'creator' || payload.userId === db.user._openid) {
    throw new Error('该成员不可移除')
  }

  mockStore.updateDb((currentDb) => ({
    ...currentDb,
    babies: currentDb.babies.map((babyItem) => babyItem._id === payload.babyId ? {
      ...babyItem,
      members: (babyItem.members || []).filter((memberItem) => memberItem.userId !== payload.userId)
    } : babyItem)
  }))
}

module.exports = {
  getFamilyMembers,
  inviteMember,
  acceptInvitation,
  removeMember
}
