export function replaceItem (arr, index, newItem) {
  if (Object.prototype.toString.call(arr) !== '[object Array]') {
    throw TypeError('Target is not array')
  }

  if (index >= arr.length || index < 0) {
    throw RangeError('Target is not allow')
  }

  return [ ...arr.slice(0, index), newItem, ...arr.slice(index + 1) ]
}
