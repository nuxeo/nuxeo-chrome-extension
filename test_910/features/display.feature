Feature: Popup Display

  As browsing on http://localhost:8080/nuxeo

  Scenario: popup.html Display
    Given the Popup page is open
    # And I have a valid Studio project
    Then I see http://localhost:8080/nuxeo/ as the connected server
    # And I see the Hot Reload button
    # And I see the Studio button
    # Test Hot Reload and Studio buttons

  Scenario: about.html Display
    Given the Popup page is open
    When I click on the About link
    Then I am taken to the About popup
    And I see the version number
    And the copyright is up-to-date
    When I click on the Back link
    Then I am taken to the popup

  Scenario: es-reindex.html Display
    Given the Popup page is open
    When I click on the Reindex ES button
    Then I am taken to the ElasticSearch Re-indexing popup
    And I see http://localhost:8080/nuxeo/ as the connected server
    When I click on the Back link
    Then I am taken to the popup

  Scenario Outline: About.html external <name> link
    Given the About page is open
    When I click on the <name> link
    Then the <title> page opens

    Examples:
      | name     | title                              |
      | Apache   | Apache License, Version 2.0        |
      | Feedback | ProdPad - Customer Feedback Portal |

