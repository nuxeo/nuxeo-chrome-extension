Feature: Search

  Scenario: Search Document
    Given the Popup extension page is open
    And I have a File document in Nuxeo
    When I enter File in search input
    Then I see the extension search results element
    And the server responds with 1 document
    And the #1 document title is My_File and the parent path is /default-domain/
