Feature: Popup Display

  As browsing on http://localhost:8080/nuxeo

  Background:
    Given the extension is open

  Scenario: Popup.html Display
    Then I can see http://localhost:8080/nuxeo/ as the connected server
    # Test Hot Reload and Studio buttons here

  Scenario: About.html Display
    When I click on the About link
    Then I am taken to the About popup
    And I can see the version number
    And the copyright is up-to-date
    When I click on the Apache link
    Then I am taken to the apache license page
    When I click on the feedback link
    Then I am taken to the feedback page