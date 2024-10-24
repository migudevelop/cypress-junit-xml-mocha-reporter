const {
  isFunction,
  isUndefined,
  isEmptyArray
} = require('@migudevelop/types-utils')
const { reporters } = require('mocha')
const xmlSanitizer = require('xml-sanitizer')

const JiraIdsManager = require('./JiraIdsManager')
const Logger = require('./Logger')
const { Base } = reporters

class TestCase {
  _runner = null
  _options = {}
  _jiraIdsManager = null

  constructor(runner, options) {
    this._runner = runner
    this._options = options
    this._jiraIdsManager = new JiraIdsManager(this._options)
  }

  /**
   * Produces an xml config for a given test case.
   * @param {object} test - test case
   * @param {object} err - if test failed, the failure object
   * @returns {object}
   */
  getTestcaseData(test, err) {
    const testConfig = this._getTestConfig(test)
    const name = xmlSanitizer(test.fullTitle())
    const classname = xmlSanitizer(test.title)

    const testcase = []

    const jiraIds = this._jiraIdsManager.getJiraIds(testConfig, {
      name,
      classname
    })

    if (isEmptyArray(jiraIds)) {
      testcase.push({
        testcase: [
          this._createTestCaseElement({
            name,
            duration: test?.duration,
            classname
          })
        ]
      })
    } else {
      jiraIds.forEach((jiraId) => {
        testcase.push({
          testcase: [
            this._createTestCaseElement({
              name: jiraId.name,
              duration: test?.duration,
              classname: jiraId.classname
            }),
            ...this._createTestCaseProperties(jiraId.properties)
          ]
        })
      })
    }

    this._checkFailure(testcase, err)
    Logger.info(
      `${name} test case cotent: ${JSON.stringify(testcase, null, 2)}`
    )
    return testcase
  }

  _checkFailure(testcase, err) {
    if (err) {
      const message = this._getMessage(err)
      let failureMessage = err.stack || message
      if (!Base.hideDiff && !isUndefined(err.expected)) {
        const oldUseColors = Base.useColors
        Base.useColors = false
        failureMessage += `\n${Base.generateDiff(err.actual, err.expected)}`
        Base.useColors = oldUseColors
      }
      const failureElement = this._createFailureElement(
        err,
        message,
        failureMessage
      )
      Logger.error(`test case error: ${err}`)
      Logger.error(`test case error message: ${message}`)
      Logger.error(`test case failure message: ${failureMessage}`)

      testcase.map((data) => data.testcase.push({ failure: failureElement }))
    }
  }

  _getMessage(err) {
    if (isFunction(err?.message?.toString)) {
      return err.message
    }
    if (isFunction(err.inspect)) {
      return err.inspect()
    }
    return ''
  }

  _createFailureElement(err, message, failureMessage) {
    return {
      _attr: {
        message: xmlSanitizer(message) || '',
        type: err.name || ''
      },
      _cdata: xmlSanitizer(failureMessage)
    }
  }

  _createTestCaseElement({ name, duration, classname }) {
    return {
      _attr: {
        name,
        time: isUndefined(duration) ? 0 : duration / 1000,
        classname
      }
    }
  }

  _createTestCaseProperties(properties) {
    if (!isEmptyArray(properties)) {
      return [
        {
          properties
        }
      ]
    }
    return []
  }

  _getTestConfig(test) {
    // Cypress >9
    if (
      !isEmptyArray(test?._testConfig?.testConfigList) &&
      test?._testConfig?.testConfigList.at(-1)?.overrides
    ) {
      return test?._testConfig?.testConfigList.at(-1)?.overrides
    }
    // Cypress >6.7
    if (test?._testConfig) {
      return test?._testConfig
    }
    return {}
  }

  _createProperty({ name = '', value = '' }) {
    return { _attr: { name, value } }
  }
}

module.exports = TestCase
