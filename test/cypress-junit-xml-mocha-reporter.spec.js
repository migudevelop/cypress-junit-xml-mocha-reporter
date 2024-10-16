const chai = require('chai')
const chaiXML = require('chai-xml')

const { dirname, join } = require('path')

const {
  createReporter,
  createTestData,
  verifyMochaFile
} = require('./test-utils.js')
const { readdirSync, rmSync } = require('fs')

chai.use(chaiXML)

const FILE_OUTPUT_DIR = 'test/dist'

describe('cypress-junit-xml-mocha-reporter', function () {
  beforeEach(function () {
    delete process.env.MOCHA_FILE
  })

  afterEach(function () {
    rmSync(FILE_OUTPUT_DIR, { recursive: true })
  })

  it('should create a JUnit XML report', function (done) {
    const { filePath, reporter } = createReporter({
      mochaFile: `${FILE_OUTPUT_DIR}/mocha-file.xml`
    })
    createTestData(reporter, () => {
      verifyMochaFile(filePath)
      done()
    })
  })

  it('should create a xml file when `process.env.MOCHA_FILE` is provided', function (done) {
    process.env.MOCHA_FILE = `${FILE_OUTPUT_DIR}/custom-results.xml`
    const { reporter } = createReporter()
    createTestData(reporter, function () {
      verifyMochaFile(process.env.MOCHA_FILE)
      done()
    })
  })

  it('should create a xml file with a site file name', function (done) {
    const { filePath, reporter } = createReporter({
      mochaFile: `${FILE_OUTPUT_DIR}/[suiteFilename].xml`
    })
    createTestData(reporter, () => {
      const fileName =
        reporter._testSuites[0]?.testsuite[0]?._attr?.file ?? 'suiteFilename'
      verifyMochaFile(join(dirname(filePath), `${fileName}.xml`))
      done()
    })
  })

  it('should create a xml file with a hash file name', function (done) {
    const { filePath, reporter } = createReporter({
      mochaFile: `${FILE_OUTPUT_DIR}/test.[hash].xml`
    })

    createTestData(reporter, () => {
      const filenames = readdirSync(dirname(filePath))
      const fileNameWithHash = filenames.find((files) =>
        /(^test\.)([a-f0-9]{32})(\.xml)$/i.test(files)
      )
      verifyMochaFile(join(dirname(filePath), fileNameWithHash))
      done()
    })
  })
})
