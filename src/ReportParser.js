const fs = require('fs');
const path = require('path');
const async = require('async');

class ReportParser {
  async parse(config, reportCallBack) {
    var noError = 'no errors';
    try {

      // check if config object has the necessary properties
      this.validateConfig(config);

      // construct file path and read in file
      var data = await this.readReport(config);

      // find and get value of target field
      var parsed_value = this.getValue(config, data);

      // invoke callback
      reportCallBack(noError, parsed_value);

      // remove report if necessary
      await this.removeReport(config);
    }

    // catch thrown errors
    catch (err) {
      // ENOENT error is for read file errors
      if (err.code === 'ENOENT') {
        reportCallBack('file not found', '');
        return;
      }
      reportCallBack(err.message, '');
    }
  }

  validateConfig(config) {
    if (!config.hasOwnProperty('working_dir') ||
      !config.hasOwnProperty('filename') ||
      !config.hasOwnProperty('target_field')) {
      throw new Error('config object is not constructed properly');
    }
  }

  async readReport(config) {
    var pathToFile = path.join(config.working_dir, config.filename);
    return await fs.promises.readFile(pathToFile, 'utf8');
  }

  getValue(config, data) {
    // find target field index using regex with word boundary at the end
    // throws error if the target field is not found
    var regex = new RegExp(config.target_field + '\\b');
    var targetIndex = data.search(regex);
    if (targetIndex < 0) {
      throw new Error('target field not found');
    };

    // use the target index to separate out field line
    // split line on line return and colon, max 2 items
    // target value will be at 1st index. trim spaces
    return data.substring(targetIndex)
      .split((/[\r\n:]+/), 2)[1]
      .trim();
  }

  async removeReport(config) {
    // check if optional delete property is present and if it is true
    // using string constructor in case if value is a boolean or string 
    if (config.hasOwnProperty('remove_after_parse') &&
      String(config.remove_after_parse).toLowerCase() === 'true') {
      var pathToFile = path.join(config.working_dir, config.filename);
      await fs.promises.unlink(pathToFile);
    }
  }
}

module.exports = ReportParser;