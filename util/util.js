module.exports = {
  promisify (fn) {
    return (...args) => {
      return new Promise((resolve, reject) => {
        fn(...args, (err, ...values) => {
          if (err) reject(err)

          if (values && values.length) {
            resolve(values)
          } else {
            resolve(values)
          }
        })
      })
    }
  },
  callbackify (fn) {
    return (...args) => {
      const params = [...args].slice(0, -1)
      const cb = args[args.length - 1]
      fn(...params).then(value => {
        cb(null, value)
      }).catch(err => {
        cb(err)
      })
    }
  },
  format (template, ...args) {
    const params = [...args];

    const printObj = (obj) => {
      if (Array.isArray(obj)) {
        let str = '['
        obj.forEach((value, index) => {
          str += ' ' + printObj(value)
          if (index < obj.length - 1) {
            str += ','
          }
        })
        str += ' ]'
        return str
      }
      if (typeof obj === 'object') {
        let str = '{'
        const keys = Object.keys(obj)
        keys.forEach((key, index) => {
          str += ' ' + key + ':'
          str += ' ' + printObj(obj[key])
          if (index < keys.length - 1) {
            str += ','
          }
        })
        str += ' }'
        return str;
      }
      
      return String(obj)
    }

    return template.replace(/%[sdioO\%]/g, (placeholder) => {
      const value = params.shift();
      if (typeof value === 'undefined') return placeholder;

      switch (placeholder) {
        case '%s':
          return value;
        case '%d':
          return Number(value);
        case '%f':
          return parseFloat(value);
        case '%j':
          return JSON.stringify(value);
        case '%o':
        case '%O':
          return printObj(value);
        case '%%':
          return '%';
        default:
          return value;
      }
    })
  }
}