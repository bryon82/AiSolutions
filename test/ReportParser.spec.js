/**
 * Unit tests for ReportParser class.
 *
 * @author Bryon Bailey
 */
/* global describe, it */

const fs = require('fs');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));
chai.should();

const ReportParser = require('../src/reportParser');
var reportParser = new ReportParser();

const parser_config = {
  'working_dir': './test/resources',
  'filename': 'qa.report',
  'target_field': 'report_status'
};

describe('smoke test', function () {
  it('tests working', function () {
    expect(true).to.be.true;
  });
});

describe('valid arguments', function () {
  it('should be a function', function () {
    expect(reportParser.validArguments).to.be.a('function');
  });

  it('returns false if first argument is not an object', function () {
    expect(reportParser.validArguments(1, function(){})).to.be.false;      
  });

  it('returns false if second argument is not a function', function () {
    expect(reportParser.validArguments(parser_config, 1)).to.be.false;      
  });

  it('returns false if first argument is not an object and second argument is not a function', function () {
    expect(reportParser.validArguments(1, 1)).to.be.false;      
  }); 

  it('returns true if first argument is an object and second argument is a function', function () {
    expect(reportParser.validArguments(parser_config, function(){})).to.be.true;      
  });   
});

describe('config object validation', function () {
  it('should be a function', function () {
    expect(reportParser.validateConfig).to.be.a('function');
  });

  it('returns error with no working directory', function () {
    let parser_config = {
      'filename': 'qa.report',
      'target_field': 'report_status'
    };

    reportParser.validateConfig(parser_config, function (err, config) {
      expect(err.message).to.equal('config object is not constructed properly');
      expect(config).to.equal(parser_config);
    });
  });

  it('returns error with no filename', function () {
    let parser_config = {
      'working_dir': './test/resources',
      'target_field': 'report_status'
    };

    reportParser.validateConfig(parser_config, function (err, config) {
      expect(err.message).to.equal('config object is not constructed properly');
      expect(config).to.equal(parser_config);
    });
  });

  it('returns error with no target field', function () {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'qa.report'
    };

    reportParser.validateConfig(parser_config, function (err, config) {
      expect(err.message).to.equal('config object is not constructed properly');
      expect(config).to.equal(parser_config);
    });
  });

  it('returns no error with correct config object', function () {
    reportParser.validateConfig(parser_config, function (err, config) {
      expect(err).to.be.null;
      expect(config).to.equal(parser_config);
    });
  });
});

describe('read report', function () {
  it('should be a function', function () {
    expect(reportParser.readReport).to.be.a('function');
  });

  it('returns error when not able to find file', function () {
    let parser_config = {
      'working_dir': 'incorrect',
      'filename': 'qa.report',
      'target_field': 'report_status'
    };

    reportParser.readReport(parser_config, function (err, config, data) {
      expect(err.message).to.include('ENOENT: no such file or directory, open');
      expect(config).to.equal(parser_config);
      expect(data).to.be.undefined;
    });
  });

  it('returns a string', function () {
    reportParser.readReport(parser_config, function (err, config, data) {
      expect(err).to.be.null;
      expect(config).to.equal(parser_config);
      expect(data).to.be.a('string');
    });
  });
});

describe('get value', function () {
  it('should be a function', function () {
    expect(reportParser.getValue).to.be.a('function');
  });

  it('returns expected value', function () {
    let data = 'report_status : OK';
    reportParser.getValue(parser_config, data, function (err, config, targetValue) {
      expect(err).to.be.null;
      expect(config).to.equal(parser_config);
      expect(targetValue).to.equal('OK');
    });
  });

  it('throws error when not able to find target field', function () {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'qa.report',
      'target_field': 'report'
    };
    let data = 'report_status : OK';
    reportParser.getValue(parser_config, data, function (err, config, targetValue) {
      expect(err.message).to.equal('target field not found');
      expect(config).to.be.undefined;
      expect(targetValue).to.be.undefined;
    });
  });
});

describe('remove report', function () {
  it('should be a function', function () {
    expect(reportParser.removeReport).to.be.a('function');
  });

  it('does not remove the report without optional key', function () {
    let passedValue = 'OK';
    reportParser.removeReport(parser_config, passedValue, function (err, targetValue) {
      expect(err).to.be.null;
      expect(targetValue).to.equal(passedValue);
    });
    expect(fs.promises.access('./test/resources/qa.report')).to.eventually.be.undefined;
  });

  it('does not remove the report with optional key value false string', function () {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'qa.report',
      'target_field': 'report_status',
      'remove_after_parse': 'false'
    };

    let passedValue = 'OK';
    reportParser.removeReport(parser_config, passedValue, function (err, targetValue) {
      expect(err).to.be.null;
      expect(targetValue).to.equal(passedValue);
    });
    expect(fs.promises.access('./test/resources/qa.report')).to.eventually.be.undefined;
  });

  it('does not remove the report with optional key value false bool', function () {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'qa.report',
      'target_field': 'report_status',
      'remove_after_parse': false
    };

    let passedValue = 'OK';
    reportParser.removeReport(parser_config, passedValue, function (err, targetValue) {
      expect(err).to.be.null;
      expect(targetValue).to.equal(passedValue);
    });
    expect(fs.promises.access('./test/resources/qa.report')).to.eventually.be.undefined;
  });

  it('does remove the report with optional key value true string', function (done) {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'tempQa.report',
      'target_field': 'report_status',
      'remove_after_parse': 'true'
    };

    let passedValue = 'OK';
    let tempReport = './test/resources/tempQa.report';
    fs.writeFile(tempReport, 'temp report', function () {
      expect(fs.promises.access(tempReport)).to.eventually.be.undefined;
      reportParser.removeReport(parser_config, passedValue, function (err, targetValue) {
        expect(err).to.be.null;
        expect(targetValue).to.equal(passedValue);
      });
      expect(fs.promises.access(tempReport)).to.eventually.not.be.null;
      done();
    });
  });

  it('does remove the report with optional key value true bool', function (done) {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'tempQa.report',
      'target_field': 'report_status',
      'remove_after_parse': true
    };

    let passedValue = 'OK';
    let tempReport = './test/resources/tempQa.report';
    fs.writeFile(tempReport, 'temp report', function () {
      expect(fs.promises.access(tempReport)).to.eventually.be.undefined;
      reportParser.removeReport(parser_config, passedValue, function (err, targetValue) {
        expect(err).to.be.null;
        expect(targetValue).to.equal(passedValue);
      });
      expect(fs.promises.access(tempReport)).to.eventually.not.be.null;
      done();
    });
  });

  it('returns error when attempting to remove report', function () {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'tempQa.report',
      'target_field': 'report_status',
      'remove_after_parse': true
    };
    let passedValue = 'OK';

    reportParser.removeReport(parser_config, passedValue, function (err) {
      expect(err).to.not.be.null;
    });
  });
});

describe('parse', function () {
  it('should be a function', function () {
    expect(reportParser.parse).to.be.a('function');
  });

  it('returns expected target value', function () {
    reportParser.parse(parser_config, function (err, parsed_value) {
      expect(err).to.be.empty;
      expect(parsed_value).to.equal('OK');
    });
  });

  it('returns file not found error', function () {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'incorrect.report',
      'target_field': 'report_status'
    };

    reportParser.parse(parser_config, function (err, parsed_value) {
      expect(err).to.include('ENOENT: no such file or directory, open');
      expect(parsed_value).to.be.empty;
    });
  });

  it('returns target field not found error', function () {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'qa.report',
      'target_field': 'report'
    };

    reportParser.parse(parser_config, function (err, parsed_value) {
      expect(err).to.equal('target field not found');
      expect(parsed_value).to.be.empty;
    });
  });

  it('returns if first argument is not an object', function () {
    expect(reportParser.parse(1, function(){})).to.be.undefined;      
  });
});