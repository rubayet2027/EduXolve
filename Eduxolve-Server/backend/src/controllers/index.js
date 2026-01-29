const contentController = require('./content.controller');
const aiController = require('./ai.controller');
const searchController = require('./search.controller');

module.exports = {
  ...contentController,
  ...aiController,
  ...searchController
};
