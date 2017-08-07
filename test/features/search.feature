Feature: Search

  Scenario: Search Document
    Given the extension is open
    When I enter workspace in search input
    Then I wait until #search-results appears
    Then Server responds with 1 document
    Then Document 1 title is Workspaces and parent path /default-domain/
