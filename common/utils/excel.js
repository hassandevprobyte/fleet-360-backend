const ExcelJS = require("exceljs");

exports.export = async ({ stream, sheetName = "Sheet1", columns, rows }) => {
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream, useStyles: true });

  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns;

  for await (const row of rows) {
    worksheet.addRow(row).commit();
  }

  worksheet.commit();

  await workbook.commit();
};
