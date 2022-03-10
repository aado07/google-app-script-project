function synchroNavigation() {
    const ss = SpreadsheetApp.getActive();
    var res = "";
    const choice = Browser.msgBox('Voulez vous effectuer la synchronisation ?', Browser.Buttons.YES_NO);
    if (choice){
       if (checkIfSaleStarted()) {
          Browser.msgBox('La vente est en cours, merci d’apporter les modifications de navigations directement sur Prestashop' , Browser.Buttons.OK);
      } else {
        sendNavigationSync();
        callRequestNavigation();        
      }
    }
}


function callRequestNavigation() {
  var client_id;
  var client_secret;
  var urlparam;
  var base_path;
  var data = scriptProperties.getProperties();
  for (var key in data) {
    if (key == "client_id") client_id = data[key]
    if (key == "client_secret") client_secret = data[key]
    if (key == "SERVER_URL") urlparam = data[key]
    if (key == "BASE_PATH_NAV") base_path = data[key]
    
  }
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var id_sale = String(spreadsheet.getSheetByName("Vente").getRange(2, 5).getValue())
  url = urlparam + id_sale + base_path;
    var options = {
      "method": "post",
      "headers": {
        "Content-Type": "application/json",
        "client_id": client_id,
        "client_secret": client_secret
      },
      "payload": makeNavigationJson(), 
      "muteHttpExceptions": true
    };
    var response = UrlFetchApp.fetch(url, options);
    if (Number(response.getResponseCode()) == 200){
        spreadsheet.toast('La synchronisation des navigations a été éffectuée avec succès')
    }
    else{
                spreadsheet.toast('Une erreur s’est produite lors de la synchronisation des navigations. Merci de contacter la DSI pour plus d’informations')

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