const tcb = require('@cloudbase/node-sdk')

let app = tcb.init({ env: tcb.SYMBOL_CURRENT_ENV })
const db = app.database()

/**
 * 获取评论
 * @param {String} event.url 评论页地址
 */
exports.main = async (event, context) => {
  const res = {}
  try {
    const config = await readConfig()
    if (!config) throw new Error('数据库无配置')
    if (!config.CREDENTIALS) throw new Error('未配置登录私钥')
    if (!config.ADMIN_PASS) throw new Error('未配置管理密码')
    if (config.ADMIN_PASS !== event.password) throw new Error('密码错误')
    res.ticket = getAdminTicket(JSON.parse(config.CREDENTIALS))
  } catch (e) {
    res.message = e.message
  }
  return res
}

async function readConfig () {
  try {
    const config = await db
      .collection('config')
      .limit(1)
      .get()
    return config.data[0]
  } catch (e) {
    console.error(e)
    return null
  }
}

function getAdminTicket (credentials) {
  const customUserId = 'admin'
  app = tcb.init({ env: tcb.SYMBOL_CURRENT_ENV, credentials })
  const ticket = app.auth().createTicket(customUserId, {
    refresh: 10 * 60 * 1000 // 每十分钟刷新一次登录态， 默认为一小时
  })
  return ticket
}
