// triggers parsing and displays results in a text area inside a custom modal window
function sendEnrichmentRequest() {
  var url = "https://x-api-sales-workflow-dev.ir-e1.eu1.cloudhub.io/sale_matrices/" + SpreadsheetApp.getActiveSpreadsheet().getId() + "/sale_items/sync_history";
  var options = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "client_id": "219774f6c1fc4ebabcfafc0e8e138ac8",
      "client_secret": "1b508B7da8364289A6f835a233cEfB7C"
    },
    "payload": makeJson(), 
    "muteHttpExceptions": true
  };
  var response = UrlFetchApp.fetch(url, options);
  console.log(response);
};

function makeJson() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()

  const dict = {
    "isActive": 0,
    "productName": 8,
    "ean": 19,
    "supplierReference": 14
  }

  var frozenRows = spreadsheet.getSheetByName("Produits").getFrozenRows();
  dataRange = spreadsheet.getSheetByName("Produits").getDataRange()
  var dataRangeArray = dataRange.getValues();
  var dataHeight = dataRange.getHeight() - frozenRows;

  var saleItems = []

  for (var h = 0; h < dataHeight; ++h) {
    if (dataRangeArray[h + frozenRows][dict["isActive"]] == "0" ||
      dataRangeArray[h + frozenRows][dict["isActive"]] == "1") {
      saleItems.push(
        new SaleItem(
          (String(dataRangeArray[h + frozenRows][dict["isActive"]]) === "1"),
          String(dataRangeArray[h + frozenRows][dict["productName"]]),
          String(dataRangeArray[h + frozenRows][dict["ean"]]),
          String(dataRangeArray[h + frozenRows][dict["supplierReference"]])
        )
      )
    }
  }

  const recipient = {
    recipient: Session.getActiveUser().getEmail(),
    channel: "slack"
  }

  const sale = new Sale(
    String(spreadsheet.getSheetByName("Vente").getRange(2, 1).getValue()),
    String(spreadsheet.getSheetByName("Vente").getRange(2, 2).getValue()), // date_start
    String(spreadsheet.getSheetByName("Vente").getRange(2, 3).getValue()), // date_end
    Number(spreadsheet.getSheetByName("Vente").getRange(2, 4).getValue()), // id_root_category
    String(spreadsheet.getSheetByName("Vente").getRange(2, 5).getValue()),
    Number(spreadsheet.getSheetByName("Vente").getRange(2, 6).getValue())
  )

  const req = new MatrixEnrichementRequest(recipient, sale, saleItems)
  Logger.log(JSON.stringify(req));
  return JSON.stringify(req);

}