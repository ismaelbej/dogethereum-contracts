//

function toUint256(value) {
  if (typeof value === 'string') {
    // Assume data is hex formatted
    value = remove0x(value);
  } else {
    // Number or BignNumber
    value = value.toString(16);
  }
  return formatHexUint32(value);
}

// Format a numeric or hexadecimal string to solidity uint32
function toUint32(value) {
  if (typeof value === 'string') {
    // Assume data is hex formatted
    value = remove0x(value);
  } else {
    // Number or BignNumber
    value = value.toString(16);
  }
  // Format as 4 bytes = 8 hexadecimal chars
  return formatHexUint(value, 8);
}

function formatHexUint(str, length) {
  while (str.length < length) {
    str = "0" + str;
  }
  return str;
}

function formatHexUint32(str) {
  // To format 32 bytes is 64 hexadecimal characters
  return formatHexUint(str, 64);
}

function remove0x(str) {
  return str.startsWith("0x") ? str.substring(2) : str;
}

// Convert an hexadecimal string to buffer
function fromHex(data) {
  return Buffer.from(remove0x(data), 'hex');
}

module.exports = {
  formatHexUint,
  formatHexUint32,
  fromHex,
  remove0x,
  toUint32,
  toUint256
};
