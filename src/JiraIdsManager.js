const {
  isEmptyString,
  ensureArray,
  isNullish,
  ensureString
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
      const jiraId = this._addJiraIdPrefix(id)
      const classNameStr = this._ensureTestTitle(testTitle, classname)
      const nameWithId = this._formatStringWithId(title, jiraId)
      const classNameWithId = this._formatStringWithId(classNameStr, jiraId)
      return {
        name: nameWithId,
        classname: classNameWithId,
        properties: this._createProperty(jiraId)
      }
    })
  }

  _ensureTestTitle(testTitle, value) {
    return isNullish(testTitle) || isEmptyString(testTitle) ? value : testTitle
  }

  _formatStringWithId(value, id) {
    return `${value.trim()} ${id.trim()}`
  }

  _addJiraIdPrefix(id) {
    const prefix = ensureString(this._options?.jira?.idPrefix)
    return `${prefix.trim()}${id.trim()}`
  }

  _createProperty(value = '') {
    if (this._options?.jira?.useProperties) {
      const name = this._options?.jira?.propertiesName ?? 'jira'
      return [{ property: { _attr: { name, value } } }]
    }
    return []
  }
}

module.exports = JiraIdsManager
