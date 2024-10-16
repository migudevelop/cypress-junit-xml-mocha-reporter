const {
  isEmptyString,
  ensureArray,
  isNullish
} = require('@migudevelop/types-utils')

const Logger = require('./Logger')

class JiraIdsManager {
  _options = {}

  constructor(options) {
    this._options = options
  }

  getJiraIds(testsConfig, { name, classname = '' }) {
    const jiraIds = ensureArray(testsConfig?.jiraIds)
    Logger.info(`Main name of the test: ${name}`)
    Logger.info(`Main classname of the test: ${classname}`)
    Logger.info(`Jira ids: ${JSON.stringify(jiraIds, null, 2)}`)

    return jiraIds.map(({ id, testTitle }) => {
      const title = this._ensureTestTitle(testTitle, name)
      const classNameStr = this._ensureTestTitle(testTitle, classname)
      const nameWithId = this._formatStringWithId(title, id)
      const classNameWithId = this._formatStringWithId(classNameStr, id)
      return {
        name: nameWithId,
        classname: classNameWithId
      }
    })
  }

  _ensureTestTitle(testTitle, value) {
    return isNullish(testTitle) || isEmptyString(testTitle) ? value : testTitle
  }

  _formatStringWithId(value, id) {
    return `${value.trim()} ${id.trim()}`
  }
}

module.exports = JiraIdsManager
