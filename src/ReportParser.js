const fs = require('fs');
class ReportParser {  
  async parse(config, reportCallBack){      
    var noError = 'no errors'
    var pathToFile = config.working_dir + '\\' + config.filename;
    const data = await fs.promises.readFile(pathToFile, 'utf8');
    var targetLoc = data.search(config.target_field)
      if (targetLoc < 0){
        reportCallBack('target field not found', '');
        return;      
      }    
    var parsed_value = data.substring(targetLoc).split((/[\r\n:]+/), 2)[1].trim();  
    reportCallBack(noError, parsed_value);
  }
} 
  
const report_parser = new ReportParser();
const parser_config = { 'working_dir' : 'C:\\Users\\Bryon\\source\\repos\\AiSolutions', 'filename' : 'qa.report', 'target_field' : 'report_status'};
report_parser.parse(parser_config, (err, parsed_value) => { console.log('error is: ', err); console.log('parsed value is: ', parsed_value);});