Feature: Search

  Scenario: Search Document
    Given the Popup page is open
    When I enter workspace in search input
    Then I see the search results element
    And the server responds with 1 document
    And the #1 document title is Workspaces and the parent path is /default-domain/
