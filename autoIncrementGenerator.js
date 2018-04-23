function autoIncrementIdGenerator(initialValue) {
  initialValue = initialValue || 0
  return {
    generate() {
      initialValue++
      return initialValue
    }
  }
}

module.exports = autoIncrementIdGenerator