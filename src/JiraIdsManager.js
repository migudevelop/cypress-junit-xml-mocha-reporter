const { isEmptyString, ensureArray } = require('@migudevelop/types-utils')

class JiraIdsManager {
  _options = {}

  constructor(options) {
    this._options = options
  }

  getJiraIds(testsConfig, { name, classname = '' }) {
    const jiraIds = ensureArray(testsConfig?.jiraIds)

    return jiraIds.map(({ id, testTitle }) => {
      const title = isEmptyString(testTitle) ? name : testTitle
      const classNameStr = isEmptyString(testTitle) ? classname : testTitle
      const nameWithId = this._formatStringWithId(title, id)
      const classNameWithId = this._formatStringWithId(classNameStr, id)
      return {
        name: nameWithId,
        classname: classNameWithId
      }
    })
  }

  _formatStringWithId(value, id) {
    return `${value.trim()} ${id.trim()}`
  }
}

module.exports = JiraIdsManager
