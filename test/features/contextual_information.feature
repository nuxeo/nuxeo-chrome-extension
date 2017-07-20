Feature: Contextual Informations

  As browsing on http://localhost:8080/nuxeo

  Scenario: Check Context Informations
    Given the extension open
    Then I can see http://localhost:8080/nuxeo/ as connected server

  Scenario: Search Document
    Given the extension open
    When I enter workspace in search input
    Then I wait until #json-search-results is not empty
    Then Server responds with 1 document
    Then Document 1 title is Workspaces and parent path /default-domain/
