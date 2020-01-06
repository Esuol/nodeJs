function getSession (req, res) {
  const id = req.cookies[key]
  if(!id) {
    req.session = generate()
    handle(req, res)
  } else {
    store.get(id, (err, session) => {
     if(session) {
      if(session.cookie.expire > (new Date()).getTime()) {
        // 更新超时时间
        session.cookie.expire = (new Date()).getTime() * EXPIRES
        req.session = session
      } else {
        // 超时了
        delete sessions[id]
        req.session = session
      }
     }else {
       // 如果session过期或者口令不对 重新生成session
       req.session = session
     }
     handle(req, res)
    })
  }
}

// 响应时， 将新的session保存会缓存中

function response(req, res) {
  const writeHead = res.writeHead
  res.writeHead = function () {
    const cookies = res.getHeader('Set-Cookie')
    const session = serialize('Set-Cookie', res.session.id)
    cookies = Array.isArray(cookies) ? cookies.concat(session) : [cookies, session]
    res.setHeader('Set-cookie', cookies)
    // 保存回缓存
    store.save(req.session)
    return writeHead.apply(this, arguments)
  }
}
