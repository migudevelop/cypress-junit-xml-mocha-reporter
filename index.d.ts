/// <reference types="cypress" />

declare namespace Cypress {
  interface JiraIdsConfigOptions {
    /**
     * Id of the jira
     */
    id: string
    /**
     * Title of the test case
     * If this title is provided, replace the original title of the test case.
     */
    testTitle?: string
  }

  interface TestConfigOverrides {
    /**
     * Configuration for jira ids
     */
    jiraIds?: JiraIdsConfigOptions | JiraIdsConfigOptions[]
  }

  interface SuiteConfigOverrides {
    /**
     * Configuration for jira ids
     */
    jiraIds?: JiraIdsConfigOptions | JiraIdsConfigOptions[]
  }
}
