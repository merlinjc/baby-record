const { ensureUser } = require('../_shared/auth')
const { db } = require('../_shared/db')

exports.main = async (event) => {
  try {
    const { user, wxContext } = await ensureUser()
    const { token } = event

    if (!token) {
      return {
        code: -1,
        message: 'token 不能为空'
      }
    }

    const invitationResult = await db.collection('invitations').where({
      token,
      status: 'pending'
    }).limit(1).get()
    const invitation = (invitationResult.data || [])[0]

    if (!invitation) {
      return {
        code: -1,
        message: '邀请不存在或已失效'
      }
    }

    if (new Date(invitation.expiresAt).getTime() < Date.now()) {
      return {
        code: -1,
        message: '邀请已过期'
      }
    }

    const babyResult = await db.collection('baby_profiles').doc(invitation.babyId).get()
    const baby = babyResult.data

    if (!baby) {
      return {
        code: -1,
        message: '宝宝档案不存在'
      }
    }

    const members = baby.members || []
    const memberExists = members.some((member) => member.userId === wxContext.OPENID)

    if (!memberExists) {
      members.push({
        userId: wxContext.OPENID,
        role: invitation.role || 'member',
        relationship: invitation.relationship || '',
        joinTime: db.serverDate()
      })

      await db.collection('baby_profiles').doc(invitation.babyId).update({
        data: {
          members,
          updateTime: db.serverDate()
        }
      })
    }

    const babyProfiles = user.babyProfiles || []
    if (!babyProfiles.includes(invitation.babyId)) {
      await db.collection('users').doc(user._id).update({
        data: {
          babyProfiles: db.command.push(invitation.babyId),
          updateTime: db.serverDate()
        }
      })
    }

    await db.collection('invitations').doc(invitation._id).update({
      data: {
        status: 'accepted',
        acceptedBy: wxContext.OPENID,
        acceptedTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    return {
      code: 0,
      message: '已加入家庭',
      data: {
        babyId: invitation.babyId,
        babyName: invitation.babyName,
        role: invitation.role || 'member'
      }
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '接受邀请失败'
    }
  }
}
