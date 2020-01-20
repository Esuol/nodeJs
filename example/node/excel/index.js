var excelPort = require('excel-export');
var path = require('path')
exports.write = function(req, res, next) {
    var datas = req.datas;
    var conf = {};
    var filename = 'filename'; //只支持字母和数字命名


    conf.cols = [{
        caption: '学号',
        type: 'string',
        width: 20
    }, {
        caption: '姓名',
        type: 'string',
        width: 40
    }, {
        caption: '岗位',
        type: 'string',
        width: 200
    }, {
        caption: '工时(h)',
        type: 'string',
        width: 200
    }];


    var array = [];
    array = [
        [13084233, Jake, 图书馆, 20],
        [13084233, Jake, 图书馆, 20],
        [13084233, Jake, 图书馆, 20],
        [13084233, Jake, 图书馆, 20],
        [13084233, Jake, 图书馆, 20]
    ];


    conf.rows = array;
    var result = excelPort.execute(conf);

    var random = Math.floor(Math.random() * 10000 + 0);

    var uploadDir = path.join(__dirname, '../', '/public/files/')
    var filePath = uploadDir + filename + random + ".xlsx";

    fs.writeFile(filePath, result, 'binary', function(err) {
        if (error) {
            console.log(error);
        }
    });
}