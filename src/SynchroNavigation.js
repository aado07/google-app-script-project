function synchroNavigation() {

  setGlobalPropeties();
  
  var ui = SpreadsheetApp.getUi(); 

  var result = ui.alert(
    'Confirmation',
    'Voulez vous effectuer la synchronisation ?',
    ui.ButtonSet.YES_NO);

  if (result === ui.Button.YES) {
    // User clicked "Yes".
    if (checkIfSaleStarted()) {
      ui.alert('Alerte', 'La vente est en cours, merci d’apporter les modifications de navigations directement sur Prestashop.', ui.ButtonSet.OK);
    }
    else {
      // Sale is started
      sendNavigationSync();
      callRequestNavigation();
    }
  }
}


function callRequestNavigation() {

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()

  var documentProperties = PropertiesService.getDocumentProperties();
  var idSale = String(spreadsheet.getSheetByName("Vente").getRange(2, 5).getValue())

  // set Properties variable
  var clientId = documentProperties.getProperty("client_id");
  var clientSecret = documentProperties.getProperty("client_secret");
  var urlParam = documentProperties.getProperty("SERVER_URL");
  var basePath = documentProperties.getProperty("BASE_PATH_NAV");

  var messageText = "";
  var errorTypeDesc = "";
  var ui = SpreadsheetApp.getUi(); // Same variations.

  try {
        
        url = urlParam + idSale + basePath;
        var options = {
          "method": "post",
          "headers": {
            "Content-Type": "application/json",
            "client_id": clientId,
            "client_secret": clientSecret
          },
          "payload": makeNavigationJson(),
          "muteHttpExceptions": true
        };

        var response = UrlFetchApp.fetch(url, options);
        var codeResult = Number(response.getResponseCode());
        
        if (codeResult === 200) {

          ui.alert(
            '🗸 Succès',
            'La synchronisation des navigations a été éffectuée avec succès',
            ui.ButtonSet.OK);
        }
        else {
                var messageContent = JSON.parse(response.getContentText());
                if (!isObjEmpty(messageContent)){
                  if (!isObjEmpty(messageContent.error)){
                      var type = messageContent.error[0].type;
                      errorTypeDesc = '📛 Erreur ' + ': '+ type +' ('+codeResult+')';  
                      if (type === "HTTP:BAD_REQUEST") {  messageText = 'MESSAGE : ' + messageContent.error[0].message + '\n' + '\n' + 'DESCRIPTION : ' + messageContent.error[0].description[0].type + '\n' + messageContent.error[0].description[0].message + '\n' +  messageContent.error[0].description[0].description; }
                      if (type === "HTTP:INTERNAL_SERVER_ERROR"){messageText = 'MESSAGE : '+ messageContent.error[0].message;}
                      if (type === "APIKIT:BAD_REQUEST"){messageText = 'MESSAGE : '+ messageContent.error[0].message;}
                      if (type === "FUNCTIONNAL:BAD_REQUEST"){messageText =  'MESSAGE : '+messageContent.error[0].message + + '\n'+ '\n'+'DESCRIPTION : '+messageContent.error[0].description; }

                      ui.alert(
                      errorTypeDesc,
                      messageText,
                      ui.ButtonSet.OK);
                  }
                }

        }
  } catch (err) {
    ui.alert(
          '📛 Failed with error %s',
          err.message,
          ui.ButtonSet.OK);
  }

};




function makeNavigationJson() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()

  const dict = {
    "isActive": 0,
    "position": 2,
    "category1": 3,
    "category2": 4,
    "category3": 5,
    "ean13": 19
  }

  var frozenRows = spreadsheet.getSheetByName("Produits").getFrozenRows();
  var dataRange = spreadsheet.getSheetByName("Produits").getDataRange();
  var dataRangeArray = dataRange.getValues();
  var dataHeight = dataRange.getHeight() - frozenRows;

  var items = []

  for (var h = 0; h < dataHeight; ++h) {
    if (dataRangeArray[h + frozenRows][dict["isActive"]] == "0" ||
      dataRangeArray[h + frozenRows][dict["isActive"]] == "1") {
      items.push(
        new NavigationItems(
          String(dataRangeArray[h + frozenRows][dict["category1"]]),
          String(dataRangeArray[h + frozenRows][dict["category2"]]),
          String(dataRangeArray[h + frozenRows][dict["category3"]]),
          String(dataRangeArray[h + frozenRows][dict["ean13"]]),
          Number(dataRangeArray[h + frozenRows][dict["position"]])
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
    Number(spreadsheet.getSheetByName("Vente").getRange(2, 6).getValue()),
    String(spreadsheet.getId())
  )

  const req = new SyncNavigationEnrichementRequest(recipient, sale, items)
  return JSON.stringify(req);
}