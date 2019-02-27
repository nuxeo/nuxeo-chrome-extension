Feature: Restart

  Scenario: Restart button
    Given the Popup extension page is open
    When I click on the extension Restart button
    Then I see the confirmation dialog
    When I confirm the dialog
    Then the server restarts
    And I can log back into Nuxeo