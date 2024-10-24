const {
  isFunction,
  isUndefined,
  isNullish
} = require('@migudevelop/types-utils')

const Logger = require('./Logger.js')

class Config {
  _options = {}

  constructor(optionsData) {
    Logger.info(`Inital options: ${JSON.stringify(optionsData, null, 2)}`)
    const options = this._getReporterOptions(optionsData)
    this._options.mochaFile = this._getSetting(
      options.mochaFile,
      'MOCHA_FILE',
      'results.xml'
    )
    this._options.rootSuiteTitle = this._getSetting(
      options.rootSuiteTitle,
      'ROOT_SUITE_TITLE',
      'Root Suite'
    )
    this._options.testSuitesTitle = this._getSetting(
      options.testSuitesTitle,
      'TEST_SUITES_TITLE',
      'Mocha Tests'
    )
    this._options.properties = this._getSetting(
      options.properties,
      'PROPERTIES',
      null,
      (envValue) => {
        if (envValue) {
          return envValue.split(',').reduce((properties, prop) => {
            var property = prop.split(':')
            properties[property[0]] = property[1]
            return properties
          }, [])
        }

        return null
      }
    )
    this._options.jira = this._getSetting(
      options.jira,
      'JIRA',
      { idPrefix: null, useProperties: false, propertiesName: 'jira' },
      (envValue) => JSON.stringify(envValue)
    )
    Logger.info(`Parsed options: ${JSON.stringify(optionsData, null, 2)}`)
  }

  getConfig() {
    return this._options
  }

  /**
   * Determine an option value.
   * 1. If `key` is present in the environment, then use the environment value
   * 2. If `value` is specified, then use that value
   * 3. Fall back to `defaultVal`
   * @module cypress-junit-xml-mocha-reporter
   * @param {Object} value - the value from the reporter options
   * @param {String} key - the environment variable to check
   * @param {Object} defaultVal - the fallback value
   * @param {function} transform - a transformation function to be used when loading values from the environment
   */
  _getSetting(value, key, defaultVal, transform) {
    if (!isUndefined(process.env[key])) {
      const envVal = process.env[key]
      return isFunction(transform) ? transform(envVal) : envVal
    }
    if (!isUndefined(value)) {
      return value
    }
    return defaultVal
  }

  _getReporterOptions(options) {
    if (isNullish(options)) {
      return {}
    }
    if (options.reporterOptions) {
      return options.reporterOptions
    }
    return options
  }
}

module.exports = Config
