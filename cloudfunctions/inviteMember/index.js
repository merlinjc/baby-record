const crypto = require('crypto')
const { ensureUser, verifyBabyAccess, canManageBaby } = require('../_shared/auth')
const { db } = require('../_shared/db')

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

    const baby = await verifyBabyAccess(babyId, wxContext.OPENID)

    if (!canManageBaby(baby, wxContext.OPENID)) {
      return {
        code: -1,
        message: '无权邀请成员'
      }
    }

    const token = crypto.randomBytes(12).toString('hex')
    const now = db.serverDate()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const invitation = {
      babyId,
      babyName: baby.name,
      inviterOpenId: wxContext.OPENID,
      inviterName: user.nickName || '成长记录者',
      role,
      relationship,
      token,
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
        role,
        relationship,
        sharePath: '/pages/accept-invitation/accept-invitation?token=' + token,
        expiresAt
      }
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '创建邀请失败'
    }
  }
}
