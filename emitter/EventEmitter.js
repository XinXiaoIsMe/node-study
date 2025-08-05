class EventEmitter {
  _events = {}
  _eventsCount = 0
  _maxListeners = Infinity

  on (eventName, cb) {
    const cbs = this._events[eventName] || [];
    cbs.push(cb);
    this._events[eventName] = cbs;
    if (cbs.length > this._maxListeners) {
      cbs.warned = true;
    } else {
      Reflect.deleteProperty(cbs, 'warned');
    }
    this._eventsCount = Object.keys(this._events).length
  }

  emit (eventName, ...args) {
    const cbs = this._events[eventName] || [];
    cbs.forEach(cb => cb(...args));
    if (cbs.warned) {
      Promise.resolve().then(() => {
        console.log(`MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${cbs.length} ${eventName} listeners added to [EventEmitter]. MaxListeners is ${this._maxListeners}. Use emitter.setMaxListeners() to increase limit
(Use \`node --trace-warnings ...\` to show where the warning was created)`)
      })
    }
  }

  off (eventName, cb) {
    if (typeof cb !== 'function') {
      console.error()
      return
    }

    if (this._events[eventName]) {
      Reflect.deleteProperty(this._events, eventName)
      this._eventsCount = Object.keys(this._events).length
    }
  }

  once (eventName, cb) {
    const fn = (...args) => {
      cb(...args);
      this.off(eventName, fn);
    }
    this.on(eventName, fn);
  }

  setMaxListeners (maxLength) {
    this._maxListeners = maxLength;
    Object.keys(this._events).forEach((eventName) => {
      if (this._events[eventName].length > maxLength) {
        this._events[eventName].warned = true;
      } else {
        Reflect.defineProperty(this._events[eventName],'warned');
      }
    })
  }

  getMaxListeners () {
    return this._maxListeners;
  }
}

module.exports = EventEmitter;
