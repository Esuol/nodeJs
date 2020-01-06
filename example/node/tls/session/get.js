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
