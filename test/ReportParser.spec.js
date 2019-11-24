const chai = require('chai');
chai.use(require('chai-as-promised'));
var assert = chai.assert;
const expect = chai.expect;
chai.should();
const sinon = require("sinon");
const fs = require('fs');
const ReportParser = require('../src/ReportParser');

var reportParser = new ReportParser();

describe('smoke test', function() {
  it('tests working', function() {
    expect(true).to.be.true;
  });
});

describe('config object validation', function() {
  it('should be a function', function() {
    expect(reportParser.validateConfig).to.be.a('function');
  });

  it('throws error with no working directory', function() {
    let parser_config = {
      'filename': 'qa.report',
      'target_field': 'report_status'
    };

    expect(function() {
      reportParser.validateConfig(parser_config);
    }).to.throw('config object is not constructed properly');

  });

  it('throws error with no filename', function() {
    let parser_config = {
      'working_dir': './test/resources',
      'target_field': 'report_status'
    };

    expect(function() {
      reportParser.validateConfig(parser_config);
    }).to.throw('config object is not constructed properly');
  });

  it('throws error with no target field', function() {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'qa.report'
    };

    expect(function() {
      reportParser.validateConfig(parser_config);
    }).to.throw('config object is not constructed properly');
  });

  it('does not throw an error', function() {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'qa.report',
      'target_field': 'report_status'
    };

    expect(function() {
      reportParser.validateConfig(parser_config);
    }).to.not.throw('config object is not constructed properly');
  });
});

describe('read report', function() {
  it('should be a function', function() {
    expect(reportParser.readReport).to.be.a('function');
  });

  it('throws error when not able to find file', function(done) {
    let parser_config = {
      'working_dir': 'foo',
      'filename': 'qa.report',
      'target_field': 'report_status'
    };

    reportParser.readReport(parser_config).should.be.rejectedWith(Error)
      .notify(done);
  });

  it('returns a string', async function() {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'qa.report',
      'target_field': 'report_status'
    };

    expect(await reportParser.readReport(parser_config)).to.be.a(
      'string');
  });
});

describe('get value', function() {
  it('should be a function', function() {
    expect(reportParser.getValue).to.be.a('function');
  });

  it('returns expected value', function() {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'qa.report',
      'target_field': 'report_status'
    };
    let data = 'report_status : OK';
    expect(reportParser.getValue(parser_config, data)).to.equal('OK');
  });

  it('throws error when not able to find target field', function() {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'qa.report',
      'target_field': 'report'
    };
    let data = 'report_status : OK';
    expect(function() {
      reportParser.getValue(parser_config, data);
    }).to.throw('target field not found');
  });
});

describe('remove report', function() {
  it('should be a function', function() {
    expect(reportParser.removeReport).to.be.a('function');
  });

  it('does not remove the report without optional key', async function() {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'qa.report',
      'target_field': 'report_status'
    };
    
    await reportParser.removeReport(parser_config);
    assert.isOk(fs.promises.access('./test/resources/qa.report'));
  });

  it('does not remove the report with optional key value false string', async function() {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'qa.report',
      'target_field': 'report_status',
      'remove_after_parse': 'false'
    };
    
    await reportParser.removeReport(parser_config);
    assert.isOk(fs.promises.access('./test/resources/qa.report'));
  });

  it('does not remove the report with optional key value false bool', async function() {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'qa.report',
      'target_field': 'report_status',
      'remove_after_parse': false
    };
    
    await reportParser.removeReport(parser_config);
    assert.isOk(fs.promises.access('./test/resources/qa.report'));
  });

  it('does remove the report with optional key value true string', function(done) {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'tempQa.report',
      'target_field': 'report_status',
      'remove_after_parse': 'true'
    };

    let tempReport = './test/resources/tempQa.report';
    fs.writeFile(tempReport, 'temp report', function() {   
      assert.isOk(fs.promises.access(tempReport));   
      reportParser.removeReport(parser_config);
      expect(fs.promises.access(tempReport)).to.be.empty.notify(done);
    });    
  });

  it('does remove the report with optional key value true bool', function(done) {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'tempQa.report',
      'target_field': 'report_status',
      'remove_after_parse': true
    };

    let tempReport = './test/resources/tempQa.report';
    fs.writeFile(tempReport, 'temp report', function() {   
      assert.isOk(fs.promises.access(tempReport));   
      reportParser.removeReport(parser_config);
      expect(fs.promises.access(tempReport)).to.be.empty.notify(done);
    });    
  });  
});

describe('parse', function() {
  it('should be a function', function() {
    expect(reportParser.parse).to.be.a('function');
  });

  it('returns expected target value', function(done) {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'qa.report',
      'target_field': 'report_status'
    };    
    
    reportParser.parse(parser_config, (err, parsed_value) => {
      assert.equal(err, 'no errors');
      assert.equal(parsed_value, 'OK');
      done();
    });    
  });

  it('returns file not found error', function(done) {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'incorrect.report',
      'target_field': 'report_status'
    };    
    
    reportParser.parse(parser_config, (err, parsed_value) => {
      assert.equal(err, 'file not found');
      assert.equal(parsed_value, '');
      done();
    });    
  });

  it('returns target field not found error', function(done) {
    let parser_config = {
      'working_dir': './test/resources',
      'filename': 'qa.report',
      'target_field': 'report'
    };    
    
    reportParser.parse(parser_config, (err, parsed_value) => {
      assert.equal(err, 'target field not found');
      assert.equal(parsed_value, '');
      done();
    });    
  });
});