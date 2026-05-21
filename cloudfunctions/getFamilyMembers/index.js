const { ensureUser, verifyBabyAccess, canManageBaby, getMemberRole } = require('../_shared/auth')

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
    const canManage = canManageBaby(baby, wxContext.OPENID)

    return {
      code: 0,
      message: '获取成功',
      data: {
        babyId: baby._id,
        babyName: baby.name,
        currentRole,
        currentRoleLabel: getRoleLabel(currentRole),
        canManage,
        members: (baby.members || []).map((member) => ({
          ...member,
          roleLabel: getRoleLabel(member.role),
          isSelf: member.userId === wxContext.OPENID,
          canRemove: canManage && member.role !== 'creator' && member.userId !== wxContext.OPENID
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
