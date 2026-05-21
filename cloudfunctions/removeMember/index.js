const { ensureUser, verifyBabyAccess, canManageBaby } = require('../_shared/auth')
const { db } = require('../_shared/db')

exports.main = async (event) => {
  try {
    const { wxContext } = await ensureUser()
    const { babyId, userId } = event

    if (!babyId || !userId) {
      return {
        code: -1,
        message: 'babyId、userId 不能为空'
      }
    }

    const baby = await verifyBabyAccess(babyId, wxContext.OPENID)

    if (!canManageBaby(baby, wxContext.OPENID)) {
      return {
        code: -1,
        message: '无权移除成员'
      }
    }

    const member = (baby.members || []).find((item) => item.userId === userId)

    if (!member || member.role === 'creator') {
      return {
        code: -1,
        message: '该成员不可移除'
      }
    }

    const nextMembers = (baby.members || []).filter((item) => item.userId !== userId)

    await db.collection('baby_profiles').doc(babyId).update({
      data: {
        members: nextMembers,
        updateTime: db.serverDate()
      }
    })

    const userResult = await db.collection('users').where({ _openid: userId }).limit(1).get()
    const targetUser = (userResult.data || [])[0]

    if (targetUser) {
      await db.collection('users').doc(targetUser._id).update({
        data: {
          babyProfiles: db.command.pull(babyId),
          updateTime: db.serverDate()
        }
      })
    }

    return {
      code: 0,
      message: '已移除成员'
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '移除成员失败'
    }
  }
}
