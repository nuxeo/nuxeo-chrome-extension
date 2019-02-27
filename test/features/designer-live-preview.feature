Feature: Designer Live Preview

  Scenario: Modify Dashboard
    Given the Popup extension page is open
    When I modify the Dashboard
    And I click on the extension Designer Live Preview button
    And I see the extension LOG INTO STUDIO link
    And I click on the extension LOG INTO STUDIO link
    And the Welcome - Nuxeo • Connect – Customer Portal page opens
    And I log into Studio
    And I go to the Popup extension page
    And I click on the extension Designer Live Preview button
    And I can see that Designer Live Preview is enabled on the Popup extension page
    Then Designer Live Preview retrieves the modifications
    And my changes can be seen in the dashboard
