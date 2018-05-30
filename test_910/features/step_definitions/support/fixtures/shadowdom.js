module.exports = function () {
  this.Before(() => {
    /**
     * This function runs in the browser context
     * @param {string|Array<string>} selectors
     * @return {?Element}
     */
    function findInShadowDom(selectors) {
      let selectorsArray = [];
      if (!Array.isArray(selectors)) {
        selectorsArray = [selectors];
      } else {
        selectorsArray = selectors;
      }

      function findElement(selector) {
        let currentElement = document;
        for (let i = 0; i < selector.length; i += 1) {
          if (i > 0) {
            currentElement = currentElement.shadowRoot;
          }

          if (currentElement) {
            currentElement = currentElement.querySelector(selector[i]);
          }

          if (!currentElement) {
            break;
          }
        }

        return currentElement;
      }

      if (!(document.body.createShadowRoot || document.body.attachShadow)) {
        selectorsArray = [selectors.join(' ')];
      }
      return findElement(selectorsArray);
    }

    /**
     * Add a command to return an element within a shadow dom.
     * The command takes an array of selectors. Each subsequent
     * array member is within the preceding element's shadow dom.
     *
     * Example:
     *
     *     const elem = browser.shadowDomElement(['foo-bar', 'bar-baz', 'baz-foo']);
     *
     * Browsers which do not have native ShadowDOM support assume each selector is a direct
     * descendant of the parent.
     */
    try {
      browser.addCommand('shadowDomElement', function (selector) {
        return this.execute(findInShadowDom, selector);
      });
    } catch(e){};

    /**
     * Provides the equivalent functionality as the above shadowDomElement command, but
     * adds a timeout. Will wait until the selectors match an element or the timeout
     * expires.
     *
     * Example:
     *
     *     const elem = browser.waitForShadowDomElement(['foo-bar', 'bar-baz', 'baz-foo'], 2000);
     */
    try {
      browser.addCommand('waitForShadowDomElement', function async(selector, timeout, timeoutMsg, interval) {
        return this.waitUntil(() => {
          const elem = this.execute(findInShadowDom, selector);
          return elem && elem.value;
        }, timeout, timeoutMsg, interval);
      });
    } catch(e){};
  });
};
