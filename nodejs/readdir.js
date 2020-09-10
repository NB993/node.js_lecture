var testFolder = './data'; //'data'도 같은 경로. 본인이 있는 경로.
var fs = require('fs');
 
fs.readdir(testFolder, function(error, filelist){
  console.log(filelist);
})