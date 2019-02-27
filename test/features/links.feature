Feature: Links

  Scenario Outline: Useful Links
    Given the Popup extension page is open
    When I hover on the Useful Links element
    Then I see the extension dropdown content element
    When I click on the extension <name> link
    Then the <title> page opens

    Examples:
      | name               | title                                                                              |
      | Explorer           | Nuxeo Platform Explorer                                                            |
      | NXQL               | NXQL \| Nuxeo Documentation                                                        |
      | EL Scripting       | Understand Expression and Scripting Languages Used in Nuxeo \| Nuxeo Documentation |
      | MVEL               | Use of MVEL in Automation Chains \| Nuxeo Documentation                            |
      | Workflow Variables | Variables Available in the Automation Context \| Nuxeo Documentation               |
      | Escalation Rules   | Escalation Service \| Nuxeo Documentation                                          |
      | Nuxeo Elements     | nuxeo                                                                              |
      | Nuxeo Layouts      | Nuxeo Showcase - Layout Service (forms, views, and actions)                        |
      | Style Guide        | Nuxeo Platform - Style Guide                                                       |
      | Automation Doc     | Nuxeo Automation Documentation                                                     |

 # Scenario: Studio button
 #    Given the Popup extension page is open
 #    And I have a valid Studio project
 #    When I click on the extension Studio button

  Scenario: API Playground link
    Given the Popup extension page is open
    # And I have CORS configuration
    And I hover on the Useful Links element
    When I click on the extension API Playground link
    Then the Nuxeo API Playground page opens
    And I am connected to API Playground on http://localhost:8080/nuxeo
