// Packages:
import http from 'http'


// Functions:
const generatePort = (() => {
  let portNum = 9000
  return () => portNum++
})()


// Exports:
export const checkFields = (t, object, fields) => {
  fields.forEach(field => t.true(object[ field ] !== undefined))
}

export const createHttpServer = (requestHandler) => {
  const server = http.createServer(requestHandler)
  const port = generatePort()
  return {
    url: `http://127.0.0.1:${ port }`,
    start: () => new Promise((resolve, reject) =>
      server.listen(port, err => err ? reject(err) : resolve())
    ),
    stop: () => new Promise((resolve, reject) =>
      server.close(err => err ? reject(err) : resolve())
    ),
  }
}
