Feature: Automation Tracing

  Scenario: Automation Call Tracing toggle
    Given the Popup page is open
    And traces are disabled from the Popup page

    When I hover on the Useful Links element
    And I click on the Automation Doc link
    And the Nuxeo Automation Documentation page opens
    And I click on the AttachFiles operation
    Then I am taken to the AttachFiles - Nuxeo Automation Documentation page
    And I can see that traces are disabled on the Automation Documentation page

    When traces are enabled from the Automation Documentation page
    And I go to the Popup page
    Then I can see that traces are enabled on the Popup page

    When traces are disabled from the Popup page
    And I go to the AttachFiles - Nuxeo Automation Documentation page
    Then I can see that traces are disabled on the Automation Documentation page
