export function replaceItem (arr, index, newItem) {
  if (Object.prototype.toString.call(arr) !== '[object Array]') {
    throw TypeError('Target is not array')
  }

  if (index >= arr.length || index < 0) {
    throw RangeError('Target is not allow')
  }

  return [ ...arr.slice(0, index), newItem, ...arr.slice(index + 1) ]
}

export function flow (funcs) {
  const length = funcs.length

  return function () {
    let index = 0
    let result = funcs[index].apply(this, arguments)
    while (++index < length) {
      result = funcs[index].call(this, result)
    }

    return result
  }
}

export function isObject (value) {
  const type = typeof value
  return value != null && (type === 'object' || type === 'function')
}

export function isArray (value) {
  return Array.isArray(value)
}

export function isInteger (value) {
  return typeof value === 'number'
    && isFinite(value)
    && Math.floor(value) === value
}

export function createArray (arrLength, processser) {
  const arr = []
  for (let i = 0; i < arrLength; i++) {
    arr.push(processser(i))
  }

  return arr
}

export function randomInt (min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}
