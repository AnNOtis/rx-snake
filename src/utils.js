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
