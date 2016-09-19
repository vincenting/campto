/**
 * Created by vt on 16/7/26.
 */

const confusingCharCodes = '0,1,9,g,i,j,l,o,q,r,t,O,I,J,L'
  .split(',')
  .map(char => char.charCodeAt())

const availableChars = Array(122 - 49)
  .fill()
  .map((_, idx) => 122 - idx)
  .filter(charCode => {
    return confusingCharCodes.indexOf(charCode) === -1 &&
      !(charCode > 57 && charCode < 65) &&
      !(charCode > 90 && charCode < 97)
  })
  .map(charCode => String.fromCharCode(charCode))

module.exports = _ => {
  const subject = Array(4)
    .fill()
    .map(_ => availableChars[parseInt(Math.random() * availableChars.length, 10)])
  return {
    subject: subject,
    result: subject.join('').toLowerCase()
  }
}

require('./').register('alphabet', module.exports)
