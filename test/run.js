/**
 * Wrapper Script to ensure to close Phantom when something when wrong in a script
 */
const system = require('system');

if (system.args.length < 2) {
  console.error('Missing Script to execute');
  phantom.exit(2);
}

try {
  for (let i = 1; i < system.args.length; i++) {
    var scriptFileName = system.args[i];
    console.log(`🍻  Running ${scriptFileName} script`);
    require(`./${scriptFileName}`);
  }
} catch (error) {
  console.log(`❌  ${error}`);
  console.log(error.stack);

  phantom.exit(5);
}
