Feature: Restart

  Scenario: Restart button
    Given the Popup page is open
    When I click on the Restart button
    Then I see the confirmation dialog
    When I confirm the dialog
    Then the server restarts