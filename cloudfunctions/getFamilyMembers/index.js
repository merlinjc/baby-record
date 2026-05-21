const { ensureUser, verifyBabyAccess, canManageBaby, getMemberRole } = require('../_shared/auth')

exports.main = async (event) => {
  try {
    const { wxContext } = await ensureUser()
    const { babyId } = event

    if (!babyId) {
      return {
        code: -1,
        message: 'babyId 不能为空'
      }
    }

    const baby = await verifyBabyAccess(babyId, wxContext.OPENID)
    const currentRole = getMemberRole(baby, wxContext.OPENID)

    return {
      code: 0,
      message: '获取成功',
      data: {
        babyId: baby._id,
        babyName: baby.name,
        currentRole,
        canManage: canManageBaby(baby, wxContext.OPENID),
        members: (baby.members || []).map((member) => ({
          ...member,
          isSelf: member.userId === wxContext.OPENID,
          canRemove: canManageBaby(baby, wxContext.OPENID) && member.role !== 'creator' && member.userId !== wxContext.OPENID
        }))
      }
    }
  } catch (error) {
    return {
      code: -1,
      message: error.message || '获取家庭成员失败'
    }
  }
}
