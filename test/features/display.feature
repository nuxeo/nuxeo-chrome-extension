Feature: Popup Display

  As browsing on http://localhost:8080/nuxeo

  Scenario: popup.html Display
    Given the Popup extension page is open
    # And I have a valid Studio project
    Then I see http://localhost:8080/nuxeo/ as the connected server
    # And I see the extension Hot Reload button
    # And I see the extension Studio button
    # Test Hot Reload and Studio buttons

  Scenario: about.html Display
    Given the Popup extension page is open
    When I click on the extension About link
    Then the About - Nuxeo Dev Tools page opens
    And I see the version number
    And the copyright is up-to-date
    When I click on the extension Back link
    Then the Nuxeo Dev Tools page opens

  Scenario: es-reindex.html Display
    Given the Popup extension page is open
    When I click on the extension Reindex ES button
    Then the ElasticSearch Re-indexing - Nuxeo Dev Tools page opens
    And I see http://localhost:8080/nuxeo/ as the connected server
    When I click on the extension Back link
    Then the Nuxeo Dev Tools page opens

  Scenario Outline: About.html external <name> link
    Given the About extension page is open
    When I click on the extension <name> link
    Then the <title> page opens

    Examples:
      | name     | title                              |
      | Apache   | Apache License, Version 2.0        |
      | Feedback | - We'd love to hear your ideas!    |

