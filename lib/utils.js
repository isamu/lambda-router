const isNull = (data) => {
  if (data === null || data === undefined) {
    return true;
  }
  return false;
}

module.exports = {
  isNull,
};

