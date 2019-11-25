const ReportParser = require('./reportParser');

const report_parser = new ReportParser();
const parser_config = { 'working_dir' : './',
                        'filename' : 'qa.report',
                        'target_field' : 'report_status',
                        'remove_after_parse' : 'false' };
report_parser.parse(parser_config, (err, parsed_value) => { 
                                      console.log('error is: ', err);
                                      console.log('parsed value is: ', parsed_value);});
