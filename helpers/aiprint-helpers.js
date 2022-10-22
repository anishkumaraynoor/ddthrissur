







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
  var dat = body.date;
  var date = moment(dat, "YYYY/MM/DD").format("DD/MM/YYYY")





    

    

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
    

    doc.setData({
      date: date,
college: body.college,
malayalam: body.malayalam,
fileno: body.fileno,
name: body.name,
designation: body.designation,
lrno: body.lrno,
lrdate: body.lrdate,


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