// Imports:
import { user } from './index'


// Exports:
const marginWebSocket = (opts) => ({
  user: user(opts, 'margin')
})

export default marginWebSocket
