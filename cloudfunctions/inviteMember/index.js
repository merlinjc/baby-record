const crypto = require('crypto')
const {
  ensureUser,
  verifyBabyAccess,
  canManageBaby,
  normalizeMemberRole,
  ensureCompletedUserProfile
} = require('../_shared/auth')
const { db } = require('../_shared/db')

function createInviteCode() {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

async function generateUniqueInviteCode() {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const inviteCode = createInviteCode()
    const existing = await db.collection('invitations').where({
      inviteCode
    }).limit(1).get()

    if (!(existing.data || []).length) {
      return inviteCode
    }
  }

  throw new Error('邀请码生成失败，请重试')
}

exports.main = async (event) => {
  try {
    const { user, wxContext } = await ensureUser()
    const { babyId, role = 'member', relationship = '' } = event

    if (!babyId) {
      return {
        code: -1,
        message: 'babyId 不能为空'
      }
    }

    ensureCompletedUserProfile(user)

    const baby = await verifyBabyAccess(babyId, wxContext.OPENID)

    if (!canManageBaby(baby, wxContext.OPENID)) {
      return {
        code: -1,
        message: '无权邀请成员'
      }
    }

    const safeRole = normalizeMemberRole(role)
    const token = crypto.randomBytes(12).toString('hex')
    const inviteCode = await generateUniqueInviteCode()
    const now = db.serverDate()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const invitation = {
      babyId,
      babyName: baby.name,
      inviterOpenId: wxContext.OPENID,
      inviterName: user.nickName || '成长记录者',
      role: safeRole,
      relationship,
      token,
      inviteCode,
      status: 'pending',
      expiresAt,
      createTime: now,
      updateTime: now
    }

    const addResult = await db.collection('invitations').add({
      data: invitation
    })

    return {
      code: 0,
      message: '邀请已创建',
      data: {
        _id: addResult._id,
        token,
        inviteCode,
        role: safeRole,
        relationship,
        sharePath: '/pages/accept-invitation/accept-invitation?code=' + inviteCode,
        expiresAt,
        isOneTime: true
      }
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '创建邀请失败'
    }
  }
}
