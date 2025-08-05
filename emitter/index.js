const EventEmitter = require('events')
// const EventEmitter = require('./EventEmitter')

const emitter = new EventEmitter()

emitter.setMaxListeners(1)

emitter.on('click', (value) => {
  console.log(`1: ${value}`)
})

emitter.on('click', (value) => {
  console.log(`2: ${value}`)
})

emitter.on('click', (value) => {
  console.log( `3: ${value}`)
})

emitter.on('mouseover', () => {})

emitter.once('mousemove', (value) => {
  console.log(`mousemove: ${value}`)
})

const handleMouseDown = () => {
  console.log('mousedown')
}
emitter.on('mousedown', handleMouseDown)

emitter.emit('click', 'test')
emitter.emit('mousemove', 1) // 1
emitter.emit('mousemove', 2) // 不会执行

emitter.off('mousedown', handleMouseDown)
emitter.emit('mousedown') // 不会执行

console.log(emitter.getMaxListeners(), emitter)