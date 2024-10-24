# cypress-junit-xml-mocha-reporter
![NPM Version](https://img.shields.io/npm/v/cypress-junit-xml-mocha-reporter)
![GitHub Release](https://img.shields.io/github/v/release/migudevelop/cypress-junit-xml-mocha-reporter)
![GitHub License](https://img.shields.io/github/license/migudevelop/cypress-junit-xml-mocha-reporter)

This is a cypress reporter that produces JUnit style XML test results and allows to split the same test in different test cases by jira id, this improves performance and avoids reloading the page in each test if we want to group different tests in the same test case.

## Table of Contents

<details>
<summary><strong>Details</strong></summary>

- [Installation](#installation)
- [Usage](#usage)
  * [Split the same test case by id of jira](#split-the-same-test-case-by-id-of-jira)
  * [Append properties to testsuite](#append-properties-to-testsuite)
  * [Results Report](#results-report)
  * [Configuration options](#configuration-options)
- [Debug mode](#debug-mode)
- [License](#license)

</details>

## Installation

```shell
 pnpm install cypress-junit-xml-mocha-reporter --save-dev
```

```shell
 npm install cypress-junit-xml-mocha-reporter --save-dev
```

## Usage
Run mocha with `cypress-junit-xml-mocha-reporter`:

```shell
 mocha test --reporter cypress-junit-xml-mocha-reporter
```
This will output a results file at `./results.xml`.
You may optionally declare an alternate location for results XML file by setting
the environment variable `MOCHA_FILE` or specifying `mochaFile` in `reporterOptions`:

```shell
 MOCHA_FILE=./path_to_your/file.xml mocha test --reporter cypress-junit-xml-mocha-reporter
```
or
```shell
 mocha test --reporter cypress-junit-xml-mocha-reporter --reporter-options mochaFile=./path_to_your/file.xml
```
or
```javascript
const mocha = new Mocha({
    reporter: 'cypress-junit-xml-mocha-reporter',
    reporterOptions: {
        mochaFile: './path_to_your/file-results.xml'
    }
});
```

### Split the same test case by id of jira

You can add jira keys in the `testConfig` options of a test case to split the same test into different test cases. These keys should be provided in an array of objects, e.g:
```js
  it(
    "testcase",
    {
      jiraIds: [
        { id: "JIRA.KEY.1" },
        { id: "JIRA.KEY.2" },
        { id: "JIRA.KEY.3" },
      ],
    },
    () => {
      expect(2).to.be.greaterThan(1);
    }
  );
```

This is useful if you want to test different tests on the same test in Cypress without affecting performance. If you want to provide a different title to the test case you can add the `testTitle` property to each of the keys in the test case.
>[!IMPORTANT]
> If the `testTitle` property is not provided, the title will be the title of the test case.

If the test case it's this:
```js
describe("test", () => {
  it(
    "testcase",
    {
      jiraIds: [
        { id: "JIRA.KEY.1", testTitle: "should display test 1" },
        { id: "JIRA.KEY.2", testTitle: "should display test 2" },
        { id: "JIRA.KEY.3" },
      ],
    },
    () => {
      expect(2).to.be.greaterThan(1);
    }
  );
});
```

the result it's this:
```xml
<testsuites>
  <testsuite>
    <testcase name="should display test 1 JIRA.KEY.1" time="0.034" classname="should display test 1 JIRA.KEY.1">
    </testcase>
    <testcase name="should display test 2 JIRA.KEY.2" time="0.034" classname="should display test 2 JIRA.KEY.2">
    </testcase>
    <testcase name="test testcase JIRA.KEY.3" time="0.034" classname="testcase JIRA.KEY.3">
    </testcase>
  </testsuite>
</testsuites>
```

### Adding jira ids to test cases as properties

You can also add the jira ids to the test cases as properties by adding the `jira.useProperties` option of the `reporterOptions` in the `cypress.config.file`, for example:
>[!NOTE]
> If you need to change the name of the property you can provide another name by adding the `propertiesName` property. By default the name is `jira`.
```javascript
{
    reporter: 'cypress-junit-xml-mocha-reporter',
    reporterOptions: {
        jira: {
          useProperties: true,
          propertiesName: "foo", // By default it's "jira"
        },
    }
}
```

the result it's this:
```xml
<testsuites>
  <testsuite>
    <testcase name="should display test 1 JIRA.KEY.1" time="0.033" classname="should display test 1 JIRA.KEY.1">
      <properties>
        <property name="foo" value="JIRA.KEY.1"/>
      </properties>
    </testcase>
  </testsuite>
</testsuites>
```

### Adding a prefix to the jira ids

You can also add a prefix to the jira ids in the `jira.idPrefix` option of the `reporterOptions` in the `cypress.config.file`, for example,
If you want to add the `JIRA.` prefix in this test case you must add the `idPrefix` option in the config file:
```javascript
{
    reporter: 'cypress-junit-xml-mocha-reporter',
    reporterOptions: {
        jira: {
          idPrefix: "JIRA.",
        },
    }
}
```
```js
describe("test", () => {
  it(
    "testcase",
    {
      jiraIds: [
        { id: "KEY.1", testTitle: "should display test 1" },
        { id: "KEY.2" },
      ],
    },
    () => {
      expect(2).to.be.greaterThan(1);
    }
  );
});
```

the result it's this:
```xml
<testsuites>
  <testsuite>
    <testcase name="should display test 1 JIRA.KEY.1" time="0.034" classname="should display test 1 JIRA.KEY.1">
    </testcase>
    <testcase name="should display test 2 JIRA.KEY.2" time="0.034" classname="should display test 2 JIRA.KEY.2">
    </testcase>
  </testsuite>
</testsuites>
```

### Append properties to testsuite

You can also add properties to the report under `testsuite`. This is useful if you want your CI environment to add extra build props to the report for analytics purposes

```xml
<testsuites>
  <testsuite>
    <properties>
      <property name="PROPERTY_ID" value="12345"/>
    </properties>
    <testcase/>
  </testsuite>
</testsuites>
```

To do so pass them in via env variable:
```shell
PROPERTIES=PROPERTY_ID:12345 mocha test --reporter cypress-junit-xml-mocha-reporter
```
or
```javascript
const mocha = new Mocha({
    reporter: 'cypress-junit-xml-mocha-reporter',
    reporterOptions: {
        properties: {
            PROPERTY_ID: 12345
        }
    }
})
```

### Results Report

Results XML filename can contain `[hash]`, e.g. `./path_to_your/results.[hash].xml`. `[hash]` is replaced by MD5 hash of test results XML. This enables support of parallel execution of multiple `cypress-junit-xml-mocha-reporter`'s writing test results in separate files. In addition to this these placeholders can also be used:

| placeholder         | output                                            |
| ------------------- | ------------------------------------------------- |
| `[testSuitesTitle]` | will be replaced by the `testSuitesTitle` setting |
| `[rootSuiteTitle]`  | will be replaced by the `rootSuiteTitle` setting  |
| `[suiteFilename]`   | will be replaced by the filename of the spec file |
| `[suiteName]`       | will be replaced by the name the first test suite |


In order to display full suite title (including parents) just specify `testSuitesTitle` option
```javascript
const mocha = new Mocha({
    reporter: 'cypress-junit-xml-mocha-reporter',
    reporterOptions: {
        testSuitesTitle: true,
    }
});
```

You can also configure the `testsuites.name` attribute by setting `reporterOptions.testSuitesTitle` and the root suite's `name` attribute by setting `reporterOptions.rootSuiteTitle`.


### Configuration options

| Parameter                      | Default                | Effect                                                                                                                  |
| ------------------------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| mochaFile                      | `results.xml`     | Configures the file to write reports to                                                                                 |
| jira.idPrefix                     | `null`                 | Add a prefix on jira ids when jira ids are provided                                                           |
| jira.useProperties                     | `false`                 | Create a property to set the provided jira ids                                                               |
| jira.propertiesName                     | `jira`                 | Adding a name to properties when the useProperties property it's enabled                                                     |
| properties                     | `null`                 | A hash of additional properties to add to each test suite                                                               |
| rootSuiteTitle                 | `Root Suite`           | The name for the root suite. (defaults to 'Root Suite')                                                                 |
| testSuitesTitle                | `Mocha Tests`          | The name for the `testsuites` tag (defaults to 'Mocha Tests')                                                           |

## Debug mode

If you need see the log when it's executed you can provide the `DEBUG` envionment variable.
```shell
DEBUG=true
```

## License

MIT, see [LICENSE](./LICENSE) for details.
