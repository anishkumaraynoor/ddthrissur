







const { PDFNet } = require('@pdftron/pdfnet-node');

var PizZip = require('pizzip');
var Docxtemplater = require('docxtemplater');
const path = require('path');
const fs = require('fs');
var moment = require('moment');

var a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
var b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

module.exports = {
  printWork: (body, pagename, res) => {

    var total = eval(body.credit + "+" + body.subloan + "+" + body.arrears);
var balance = eval(total + "-" + body.loan);
var certificate = "അവസാന ക്രെഡിറ്റ് കാര്‍ഡിനു ശേഷം എടുത്ത വായ്പകളുടെ സാങ്ഷന്‍ ഓര്‍ഡര്‍";
if (body.loan == 0) {
certificate = "അവസാന ക്രെഡിറ്റ് കാര്‍ഡിനു ശേഷം വായ്പ എടുത്തിട്ടില്ലെന്ന സാക്ഷ്യപത്രം";
}

var dat = body.date;
var date = moment(dat, "YYYY/MM/DD").format("DD/MM/YYYY")

    

    function inWords(num) {
      if ((num = num.toString()).length > 9) return 'overflow';
      n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!n) return; var str = '';
      str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
      str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
      str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
      str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
      str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
      return str;
    }

    function replaceErrors(key, value) {
      if (value instanceof Error) {
        return Object.getOwnPropertyNames(value).reduce(function (error, key) {
          error[key] = value[key];
          return error;
        }, {});
      }
      return value;
    }

    function errorHandler(error) {
      console.log(JSON.stringify({ error: error }, replaceErrors));
      if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors.map(function (error) {
          return error.properties.explanation;
        }).join("\n");
        console.log('errorMessages', errorMessages);
      }
      throw error;
    }
    var page = pagename;
    var content = fs.readFileSync(path.resolve(__dirname, page), 'binary');
    var zip = new PizZip(content);
    var doc;

    try {
      doc = new Docxtemplater(zip);
    } catch (error) {
      errorHandler(error);
    }
    if (body.net) {
      var rupeewords = inWords(body.net);
    } else {
      rupeewords = null;
    }

    doc.setData({
      date: date,
college: body.college,
malayalam: body.malayalam,
fileno: body.fileno,
name: body.name,
designation: body.designation,
lrno: body.lrno,
lrdate: body.lrdate,
credit: body.credit,
subloan: body.subloan,
arrears: body.arrears,
loan: body.loan,
ccyear: body.ccyear,
total: total,
balance: balance,
certificate: certificate,
retirement: body.retirement

    });

    try {
      doc.render()
    }
    catch (error) {
      errorHandler(error);
    }

    var buf = doc.getZip().generate({ type: 'nodebuffer' });
    fs.writeFileSync(path.resolve(__dirname, `../files/letterreplace.docx`), buf);
    const inputPath = path.resolve(__dirname, `../files/letterreplace.docx`);
    const outputPath = path.resolve(__dirname, `../files/letter.pdf`);
    const convertToPdf = async () => {
      const pdfdoc = await PDFNet.PDFDoc.create();
      await pdfdoc.initSecurityHandler();
      await PDFNet.Convert.toPdf(pdfdoc, inputPath);
      pdfdoc.save(outputPath, PDFNet.SDFDoc.SaveOptions.e_linearized);
    }
    PDFNet.runWithCleanup(convertToPdf, 'demo:1661062729609:7a0ea5f403000000003be411797b7fe2898ac3046f9406f7bb056e53ae').then(() => {
      fs.readFile(outputPath, (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.end(err);
        } else {
          res.setHeader('ContentType', 'application/pdf');
          res.end(data);
        }
      })
    }).catch(err => {
      res.statusCode = 500;
      res.end(err);
    })
  }
}