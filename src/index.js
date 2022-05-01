#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const program = require('commander');

const {
  getConfig,
  buildPrettifier,
  logIntro,
  logItemCompletion,
  logConclusion,
  logError,
} = require('./helpers');
const {
  requireOptional,
  mkDirPromise,
  readFilePromiseRelative,
  writeFilePromise,
} = require('./utils');

// Load our package.json, so that we can pass the version onto `commander`.
const { version } = require('../package.json');

// Get the default config for this component (looks for local/global overrides,
// falls back to sensible defaults).
const config = getConfig();

// Convenience wrapper around Prettier, so that config doesn't have to be
// passed every time.
const prettify = buildPrettifier(config.prettierConfig);

program
  .version(version)
  .arguments('<postName>')
  .option(
    '-d, --desk <postDesk>',
    'Type of desk tag to generate (default: ["News"])',
    config.desk
  )
  .parse(process.argv);

const [postName] = program.args;

// Find the path to the selected template file.
const templatePath = `./template.mdx`;

// Get all of our file paths worked out, for the user's project.
const componentDir = `${program.dir}/${postName}`;
const filePath = `${componentDir}/${postName}.${program.extension}`;


logIntro({ name: postName, dir: componentDir, desk: program.desk, date: program.date });

// Check if componentName is provided
if (!componentName) {
  logError(
    `Sorry, you need to specify a name for your post like this: create-post <name>`
  );
  process.exit(0);
}

// Check to see if a directory at the given path exists
const fullPathToParentDir = path.resolve(program.dir);
if (!fs.existsSync(fullPathToParentDir)) {
  logError(
    `Sorry, you need to create a parent directory.\n(create-post is looking for a directory at ${program.dir}).`
  );
  process.exit(0);
}

// Check to see if this component has already been created
const fullPathToComponentDir = path.resolve(componentDir);
if (fs.existsSync(fullPathToComponentDir)) {
  logError(
    `Looks like this post already exists! There's already a post at ${componentDir}.\nPlease delete this directory and try again.`
  );
  process.exit(0);
}

// Start by creating the directory that our component lives in.
readFilePromiseRelative(templatePath)
  .then((template) => {
    return template;
  })
  .then((template) =>
    // Replace our placeholders with real data (so far, just the component name)
    template.replace(/POST_TITLE/g, postName)
    template.replace(/DATE_TODAY/g, date)
    template.replace(/POST_DESK/g, desk)
  )
  .then((template) =>
    writeFilePromise(filePath, template)
  )
  .then((template) => {
    logItemCompletion('Post built and saved to disk.');
    return template;
  })

  .then((template) => {
    logConclusion();
  })
  .catch((err) => {
    console.error(err);
  });