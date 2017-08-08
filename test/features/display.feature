Feature: Popup Display

  As browsing on http://localhost:8080/nuxeo

  Scenario: Popup.html Display
    Given the Popup page is open
    Then I can see http://localhost:8080/nuxeo/ as the connected server
    # Test Hot Reload and Studio buttons here

  Scenario: About.html Display
    Given the Popup page is open
    When I click on the internal About link
    Then I am taken to the About popup
    And I can see the version number
    And the copyright is up-to-date
    When I click on the internal Back link
    Then I am taken to the popup

  Scenario Outline: About.html external <name> link
    Given the About page is open
    When I click on the <name> link
    Then the <title> page opens

    Examples:
      | name     | title                              |
      | apache   | Apache License, Version 2.0        |
      | feedback | ProdPad - Customer Feedback Portal |

