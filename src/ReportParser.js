/**
 * Class to parse a report file by finding a target field in a report
 * file. File path, filename, target field, and optional remove after parse
 * values are provided by a config file.
 *
 * @file   This files defines the ReportParser class.
 * @author Bryon Bailey
 */

const fs = require('fs');
const path = require('path');
const async = require('async');

class ReportParser {
  /**
   * orchestrates the parsing of a report
   * @param {object}   config   config object.
   * @param {function} callback callback function.
   */
  parse(config, callback) {
    if (!this.validArguments(config, callback)){
      return;
    }
    
    // waterfall sends the results from the previous function as arguments to the next
    async.waterfall([
      async.apply(this.validateConfig, config),
        this.readReport,
        this.getValue,
        this.removeReport
    ], function (err, result) {
      let errorMessage = '';
      if (err !== null) {
        errorMessage = err.message;
        result = '';
      }
      callback(errorMessage, result);
    });
  }

  validArguments(config, callback) {
    if (typeof config !== 'object' && typeof callback !== 'function') {
      console.log('object and function were not passed in');
      return false;          
    }
    else if (typeof config !== 'object') {
      console.log('first argument was not an object');
      return false; 
    }
    else if (typeof callback !== 'function') {
      console.log('second argument was not a function');
      return false; 
    }
    return true;
  }

  /**
   * validates the config object.
   * @param {object}   config   config object.
   * @param {function} callback callback function.
   */
  validateConfig(config, callback) {
    let err = null;
    if (!Object.prototype.hasOwnProperty.call(config, 'working_dir') ||
      !Object.prototype.hasOwnProperty.call(config, 'filename') ||
      !Object.prototype.hasOwnProperty.call(config, 'target_field')) {
      err = new Error('config object is not constructed properly');
    }
    callback(err, config);
  }

  /**
   * reads the data from the the report.
   * @param {object}   config   config object.
   * @param {function} callback callback function.
   */
  readReport(config, callback) {
    let pathToFile = path.join(config.working_dir, config.filename);
    fs.readFile(pathToFile, 'utf8', function (err, data) {
      callback(err, config, data);
    });
  }

  /**
   * gets the value for the target field from the report data.
   * @param {object}   config   config object.
   * @param {string}   data     data from reading in report.
   * @param {function} callback callback function.
   */
  getValue(config, data, callback) {
    // find target field index using regex with word boundary at the end    
    let regex = new RegExp(config.target_field + '\\b');
    let targetIndex = data.search(regex);

    // throws error if the target field is not found
    if (targetIndex < 0) {
      callback(new Error('target field not found'));
      return;
    }

    /*
     * use the target index to separate out field line
     * split line on line return and colon, max 2 items
     * target value will be at 1st index. trim spaces
     */
    let targetValue = data.substring(targetIndex)
      .split((/[\r\n:]+/), 2)[1]
      .trim();

    callback(null, config, targetValue);
  }

  /**
   * check if optional delete property is present and if it is true.
   * @param {object}   config      config object.
   * @param {string}   targetValue value from target field.
   * @param {function} callback    callback function.
   */
  removeReport(config, targetValue, callback) {

    // in an async iife to await unlink and to catch a potential error
    (async function () {

      // using string constructor for value in case if value is a boolean or string 
      if (Object.prototype.hasOwnProperty.call(config, 'remove_after_parse') &&
        String(config.remove_after_parse).toLowerCase() === 'true') {

        let pathToFile = path.join(config.working_dir, config.filename);
        await fs.promises.unlink(pathToFile);
      }

      // callback for if there is no error, callback in catch if there is an error
      callback(null, targetValue);
    })().catch(error => callback(error));
  }
}

module.exports = ReportParser;