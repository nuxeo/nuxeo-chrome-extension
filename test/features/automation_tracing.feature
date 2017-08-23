Feature: Automation Tracing

  Scenario: Automation Call Tracing toggle
    Given the Popup page is open
    And traces are disabled

    When I click on the Automation Doc button
    And the Nuxeo Automation Documentation page opens
    And I click on the AttachFiles operation
    Then I am taken to the AttachFiles - Nuxeo Automation Documentation page
    And I can see that traces are disabled on the Automation Documentation page

    When I enable traces from the Automation Documentation page
    And I go to the Popup page
    Then I can see that traces are enabled on the Popup page

    When I enable traces from the Popup page
    And I go to the AttachFiles - Nuxeo Automation Documentation page
    Then I can see that traces are disabled on the Automation Documentation page
