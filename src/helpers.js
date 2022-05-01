/*
Helpers are application-specific functions.
They're useful for abstracting away plumbing and other important-but-
uninteresting parts of the code, specific to this codebase.
NOTE: For generalized concerns that aren't specific to this project,
use `utils.js` instead.
*/
const os = require('os');
const fs = require('fs');
const path = require('path');

const prettier = require('prettier');
const chalk = require('chalk');

const { requireOptional } = require('./utils');

// Get the configuration for this component.
// Overrides are as follows:
//  - default values
//  - globally-set overrides
//  - project-specific overrides
//  - command-line arguments.
//
// The CLI args aren't processed here; this config is used when no CLI argument
// is provided.
module.exports.getConfig = () => {
  const home = os.homedir();
  const currentPath = process.cwd();


  const current = new Date()
  const day = current.getDate().toString()
  const month = (((current.getMonth() + 1).toString()).length === 1 ? '0' + (current.getMonth() + 1).toString() : (current.getMonth() + 1).toString() )
  const year = current.getFullYear().toString()
  const composedDate = `${day}-${month}-${year}`

  const defaults = {
    desk: 'News',
    dir: 'src/content',
    extension: 'mdx',
    date: composedDate,
  };

  const globalOverrides = requireOptional(
    `/${home}/.create-post-config.json`
  );

  const localOverrides = requireOptional(
    `/${currentPath}/.create-post-config.json`
  );

  return Object.assign({}, globalOverrides, localOverrides, defaults);
};

module.exports.buildPrettifier = (prettierConfig) => {
  // If they haven't supplied a prettier config, check for a
  // `.prettierrc`!

  let config = prettierConfig;

  if (!config) {
    const currentPath = process.cwd();

    try {
      config = fs.readFileSync(
        path.join(currentPath, '/.prettierrc'),
        { encoding: 'utf8', flag: 'r' }
      );
    } catch (err) {
      // No big deal, they don't have a prettier config
    }

    if (config) {
      try {
        config = JSON.parse(config);
      } catch (err) {
        console.error('Count not parse .prettierrc, does not appear to be JSON')
      }
    }
  }

  return (text) => {
    return prettier.format(text, config);
  }
}

// Emit a message confirming the creation of the component
const colors = {
  red: [216, 16, 16],
  green: [142, 215, 0],
  blue: [0, 186, 255],
  gold: [255, 204, 0],
  mediumGray: [128, 128, 128],
  darkGray: [90, 90, 90],
};

module.exports.logIntro = ({ name, dir, desk }) => {
  console.info('\n');
  console.info(
    `✨  Creating the ${chalk.bold.rgb(...colors.gold)(name)} post ✨`
  );
  console.info('\n');

  const pathString = chalk.bold.rgb(...colors.blue)(dir);
  const deskString = chalk.bold.rgb(...colors.blue)(desk);

  console.info(`Directory:  ${pathString}`);
  console.info(`Desk:       ${deskString}`);

  console.info(
    chalk.rgb(...colors.darkGray)('=========================================')
  );

  console.info('\n');
};

module.exports.logItemCompletion = (successText) => {
  const checkmark = chalk.rgb(...colors.green)('✓');
  console.info(`${checkmark} ${successText}`);
};

module.exports.logConclusion = () => {
  console.info('\n');
  console.info(chalk.bold.rgb(...colors.green)('Post created! 🚀 '));
  console.info('\n');
};

module.exports.logError = (error) => {
  console.info('\n');
  console.info(chalk.bold.rgb(...colors.red)('Error creating post.'));
  console.info(chalk.rgb(...colors.red)(error));
  console.info('\n');
};