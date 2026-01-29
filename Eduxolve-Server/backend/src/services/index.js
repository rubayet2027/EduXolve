const { upload, getFileUrl, deleteFile, getFileType } = require('./upload.service');
const aiPromptService = require('./aiPrompt.service');
const embeddingService = require('./embedding.service');
const indexingService = require('./indexing.service');
const searchService = require('./search.service');

module.exports = {
  upload,
  getFileUrl,
  deleteFile,
  getFileType,
  ...aiPromptService,
  ...embeddingService,
  ...indexingService,
  ...searchService
};
