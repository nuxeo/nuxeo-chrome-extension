Feature: Hot Reload & Studio Project

  Scenario: Check Studio Project
    Given the Popup page is open
    And I hover on the Useful Links element
    And I see the Studio link
    When I click on the Studio link
    Then I am taken to my Studio project

  Scenario: Hot Reload
    Given the Popup page is open
    And I have a Workspace document in Nuxeo
    And I see the Hot Reload button

    When I go to the Home - Nuxeo Platform page
    And I navigate to the document
    And I try to create a document
    Then I can't see the Custom document type

    When I go to the Popup page
    And I click on the Hot Reload button
    Then the Nuxeo page refreshes

    When I try to create a document
    Then I see the Custom document type