const { ensureUser, normalizeMemberRole } = require('../_shared/auth')
const { db } = require('../_shared/db')

function normalizeInviteCode(code) {
  return String(code || '').trim().toUpperCase()
}

exports.main = async (event) => {
  try {
    const { user, wxContext } = await ensureUser()
    const inviteCode = normalizeInviteCode(event.code || event.inviteCode)
    const token = String(event.token || '').trim()

    if (!inviteCode && !token) {
      return {
        code: -1,
        message: '邀请码不能为空'
      }
    }

    const result = await db.runTransaction(async (transaction) => {
      const wherePayload = inviteCode
        ? { inviteCode, status: 'pending' }
        : { token, status: 'pending' }

      const invitationResult = await transaction.collection('invitations').where(wherePayload).limit(1).get()
      const invitation = (invitationResult.data || [])[0]

      if (!invitation) {
        throw new Error('邀请码不存在、已失效或已被使用')
      }

      if (new Date(invitation.expiresAt).getTime() < Date.now()) {
        await transaction.collection('invitations').doc(invitation._id).update({
          data: {
            status: 'expired',
            updateTime: db.serverDate()
          }
        })
        throw new Error('邀请码已过期')
      }

      const safeRole = normalizeMemberRole(invitation.role)
      const babyResult = await transaction.collection('baby_profiles').doc(invitation.babyId).get()
      const baby = babyResult.data

      if (!baby) {
        throw new Error('宝宝档案不存在')
      }

      const members = baby.members || []
      const memberExists = members.some((member) => member.userId === wxContext.OPENID)
      const nextMembers = memberExists ? members : members.concat({
        userId: wxContext.OPENID,
        role: safeRole,
        relationship: invitation.relationship || '',
        joinTime: db.serverDate()
      })

      const babyProfiles = user.babyProfiles || []
      const nextBabyProfiles = babyProfiles.includes(invitation.babyId)
        ? babyProfiles
        : babyProfiles.concat(invitation.babyId)

      await transaction.collection('invitations').doc(invitation._id).update({
        data: {
          status: 'accepted',
          acceptedBy: wxContext.OPENID,
          acceptedTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      })

      if (!memberExists) {
        await transaction.collection('baby_profiles').doc(invitation.babyId).update({
          data: {
            members: nextMembers,
            updateTime: db.serverDate()
          }
        })
      }

      if (nextBabyProfiles.length !== babyProfiles.length) {
        await transaction.collection('users').doc(user._id).update({
          data: {
            babyProfiles: nextBabyProfiles,
            updateTime: db.serverDate()
          }
        })
      }

      return {
        babyId: invitation.babyId,
        babyName: invitation.babyName,
        role: safeRole,
        inviteCode: invitation.inviteCode || inviteCode
      }
    })

    return {
      code: 0,
      message: '已加入家庭',
      data: result
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '接受邀请失败'
    }
  }
}
