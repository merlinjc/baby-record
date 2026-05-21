const mockStore = require('../utils/mockStore')
const cloudUtil = require('../utils/cloudUtil')

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

async function getFamilyMembers(babyId) {
  if (cloudUtil.isCloudReady()) {
    const result = await cloudUtil.callCloudFunction({
      name: 'getFamilyMembers',
      data: { babyId }
    })

    if (result && result.code === 0) {
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
    canManage,
    members: (baby.members || []).map((member) => ({
      ...member,
      isSelf: member.userId === db.user._openid,
      canRemove: canManage && member.role !== 'creator' && member.userId !== db.user._openid
    }))
  }
}

async function inviteMember(payload) {
  if (cloudUtil.isCloudReady()) {
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

  if (!canManageLocalBaby(baby, db.user._openid)) {
    throw new Error('无权邀请成员')
  }

  const token = mockStore.createId('invite')
  const invite = {
    _id: token,
    token,
    babyId: payload.babyId,
    role: payload.role || 'member',
    relationship: payload.relationship || '',
    status: 'pending',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }

  mockStore.updateDb((currentDb) => ({
    ...currentDb,
    invitations: [invite].concat(currentDb.invitations || [])
  }))

  return {
    ...invite,
    sharePath: '/pages/accept-invitation/accept-invitation?token=' + token
  }
}

async function acceptInvitation(token) {
  if (cloudUtil.isCloudReady()) {
    const result = await cloudUtil.callCloudFunction({
      name: 'acceptInvitation',
      data: { token }
    })

    if (result && result.code === 0) {
      return result.data
    }

    throw new Error(result && result.message ? result.message : '接受邀请失败')
  }

  const db = mockStore.getDb()
  const invitation = (db.invitations || []).find((item) => item.token === token && item.status === 'pending')

  if (!invitation) {
    throw new Error('邀请不存在或已失效')
  }

  mockStore.updateDb((currentDb) => ({
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
          role: invitation.role,
          relationship: invitation.relationship,
          joinTime: new Date().toISOString()
        })
    } : baby),
    invitations: (currentDb.invitations || []).map((item) => item.token === token ? {
      ...item,
      status: 'accepted'
    } : item)
  }))

  return {
    babyId: invitation.babyId,
    role: invitation.role,
    babyName: ((db.babies || []).find((item) => item._id === invitation.babyId) || {}).name || ''
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
    babies: currentDb.babies.map((baby) => baby._id === payload.babyId ? {
      ...baby,
      members: (baby.members || []).filter((member) => member.userId !== payload.userId)
    } : baby)
  }))
}

module.exports = {
  getFamilyMembers,
  inviteMember,
  acceptInvitation,
  removeMember
}
