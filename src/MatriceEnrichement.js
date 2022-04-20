// triggers parsing and displays results in a text area inside a custom modal window
function sendEnrichmentRequest() {

  setGlobalPropeties();
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var documentProperties = PropertiesService.getDocumentProperties();
  
  // set Properties variable
  var clientId = documentProperties.getProperty("client_id");
  var clientSecret = documentProperties.getProperty("client_secret");
  var urlParam = documentProperties.getProperty("SERVER_URL_SALE");
  var basePath = documentProperties.getProperty("BASE_PATH_SALE_ITEMS_SYNC_HIST");

  var messageText = "";
  var errorTypeDesc = "";
  var ui = SpreadsheetApp.getUi();

  var url = urlParam + SpreadsheetApp.getActiveSpreadsheet().getId() + basePath;
  var options = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "client_id": clientId,
      "client_secret": clientSecret
    },
    "payload": makeJson(),
    "muteHttpExceptions": true
  };

  var response = UrlFetchApp.fetch(url, options);
  var codeResult = Number(response.getResponseCode());

  if (codeResult === 200) {
    spreadsheet.toast("L'enrichissement de la matrice a été éffectuée avec succès")
    ui.alert(
      '🗸 Succès',
      "L'enrichissement de la matrice a été éffectuée avec succès",
      ui.ButtonSet.OK);
  }
  else {
    var messageContent = JSON.parse(response.getContentText());
    if (!isObjEmpty(messageContent)) {
      if (!isObjEmpty(messageContent.error)) {
        var type = messageContent.error[0].type;
        errorTypeDesc = '📛 Erreur ' + ': ' + type + ' (' + codeResult + ')';
        if (type === "HTTP:BAD_REQUEST") {  messageText = 'MESSAGE : ' + messageContent.error[0].message + '\n' + '\n' + 'DESCRIPTION : ' + messageContent.error[0].description[0].type + '\n' + messageContent.error[0].description[0].message + '\n' +  messageContent.error[0].description[0].description; }
        if (type === "HTTP:INTERNAL_SERVER_ERROR") { messageText = 'MESSAGE : ' + messageContent.error[0].message; }
        if (type === "APIKIT:BAD_REQUEST") { messageText = 'MESSAGE : ' + messageContent.error[0].message; }
        if (type === "FUNCTIONNAL:BAD_REQUEST") { messageText = 'MESSAGE : ' + messageContent.error[0].message + + '\n' + '\n' + 'DESCRIPTION : ' + messageContent.error[0].description; }

        ui.alert(
          errorTypeDesc,
          messageText,
          ui.ButtonSet.OK);
      }
    }
  }
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