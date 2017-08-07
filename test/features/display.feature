Feature: Popup Display

  As browsing on http://localhost:8080/nuxeo

  Background:
    Given the extension is open

  Scenario: Popup.html Display
    Then I can see http://localhost:8080/nuxeo/ as the connected server
    # Test Hot Reload and Studio buttons here

  Scenario: About.html Display
    When I click on the internal About link
    Then I am taken to the About popup
    And I can see the version number
    And the copyright is up-to-date

  @watch
  Scenario Outline: About.html external <name> link
    When I click on the internal About link
    Given Injected mocks
    """
    chrome.tabs.create.callsFake(function (opts) {
      //window.document.location = opts.url;
      window.open(opts.url);
    });
    """
    When I click on the <name> link
    Then current url is <url> with title <title>

    Examples:
      | name     | url                                        | title |
      | apache   | http://www.apache.org/licenses/LICENSE-2.0 | Apache License, Version 2.0 |
      | feedback | https://portal.prodpad.com/40c295d6-739d-11e7-9e52-06df22ffaf6f | ProdPad - Customer Feedback Portal |
