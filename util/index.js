// const util = require('node:util')
const util = require('./util')
const { exec } = require('node:child_process')

const execPromise = util.promisify(exec)
execPromise('node -v')
  .then(value => {
    console.log(value) // { stdout: 'v20.15.0\n', stderr: '' }
  })
  .catch(err => {
    console.log('err', err)
  })

function test (type) {
  if (type > 0) return Promise.resolve('success')
  return Promise.reject('error')
}

const testCb = util.callbackify(test)
testCb(1, (err, result) => {
  console.log(err, result) // null success
})

console.log(util.format('%s的成绩: %d, 详细成绩: %o', '小满', '100', {
  chinese: 100,
  math: 100
}))
