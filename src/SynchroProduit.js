function synchroProduit() {
    const ss = SpreadsheetApp.getActive();
    var res = "";
    const choice = Browser.msgBox('Voulez vous effectuer la synchronisation ?', Browser.Buttons.YES_NO);
    if (choice){
       if (checkIfSaleStarted()) {
          Browser.msgBox('La vente est en cours, merci d’apporter les modifications de navigations directement sur Prestashop' , Browser.Buttons.OK);
      } else {
        sendNavigationSync();
        callRequestProduct();        
      }
    }
}


function callRequestProduct() {

  var client_id;
  var client_secret;
  var urlparam;
  var base_path;
  var data = scriptProperties.getProperties();
  //Logger.log(JSON.stringify(data));
  for (var key in data) {
    if (key == "client_id") client_id = data[key]
    if (key == "client_secret") client_secret = data[key]
    if (key == "SERVER_URL") urlparam = data[key]
    if (key == "BASE_PATH_SALE_ITEMS") base_path = data[key]
    
  }
const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
var id_sale = String(spreadsheet.getSheetByName("Vente").getRange(2, 5).getValue())
var url = urlparam + id_sale + base_path;
  var options = {
    "method": "post",
    "headers": {
      "Content-Type": "application/json",
      "client_id": client_id,
      "client_secret": client_secret
    },
    "payload": makeProductJson(), 
    "muteHttpExceptions": true
  };
  var response = UrlFetchApp.fetch(url, options);
  var coderes = response.getResponseCode();
  var mesRes = response.getContentText();
  Logger.log(coderes);
  Logger.log(mesRes);
  if(Number(response.getResponseCode()) == 200){
      spreadsheet.toast('La synchronisation des produits a été éffectuée avec succès')
  }
  else{
        spreadsheet.toast('Une erreur s’est produite lors de la synchronisation des produits. Merci de contacter la DSI pour plus d’informations')

  }
};

function makeProductJson() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const dictio = {
    "isActive": 0,
    "suggested_items": 1,
    "position": 2,
    "category1": 3,
    "category2": 4,
    "category3": 5,
    "categories": 6,
    "condition": 7,
    "name" : 8,
    "default_variant_ean13" : 9,
    "declinaison1" : 10,
    "declinaison2" : 11,
    "declinaison3" : 12,
    "bundle_composition" : 13,
    "supplier_reference" : 14,
    "manufacturer_reference" : 15,
    "type": 17,
    "ean13": 19,
    "marque": 20,
    "quantity": 27,
    "wholesale_price": 32,
    "discounted_price": 36,
    "ecotax" : 39,
    "public_price" : 42,
    "tax_rate" : 54,
    "reparability_index_grade": 63,
    "reparability_index_mandatory" : 64,
    "reparability_index_criteria_grid": 65,
    "depth" : 66,
    "width" : 67,
    "height" : 68,
    "weight" : 69,
    "short_description" : 81,
    "long_description" : 82,
    "images" : 83,
    "selling_points" : 84,
    "features" : 85,
    "specificities" : 86,
    "pictograms" : 87,
    "warranty" : 88,
    "videos" : 89,
    "packaging" : 90,
    "size_guide" : 91
  }

  var frozenRows = spreadsheet.getSheetByName("Produits").getFrozenRows();
  var dataRange = spreadsheet.getSheetByName("Produits").getDataRange();
  var dataRangeArray = dataRange.getValues();
  var dataHeight = dataRange.getHeight() - frozenRows;
  var items = []
  for (var h = 0; h < dataHeight; ++h) {
      var categorieName = []
      var bundle_composition = []
      var categories = []
      var variantAttributes = []
    //if (h==0){
      if (dataRangeArray[h + frozenRows][dictio["isActive"]] == "0" ||
        dataRangeArray[h + frozenRows][dictio["isActive"]] == "1") {
          var typologie = dataRangeArray[h + frozenRows][dictio["type"]];
          
          for (var x = 1;  x <= 3; ++x) { 
            categorieName.push({"fr" : String(dataRangeArray[h + frozenRows][dictio["category" + x]])})
          }
          for (var i = 1; i <= 3; ++i) {           
            var declinaison = dataRangeArray[h + frozenRows][dictio["declinaison" + i]].split(":")
            if (declinaison.length > 1){
              variantAttributes.push({"type": declinaison[0], "value":declinaison[1] }) 
            }
          } 
          var catFormatted = dataRangeArray[h + frozenRows][dictio["categories"]].replace(/\s/g, "").split(",",8);
          for (var i = 0; i < catFormatted.length; ++i) {           
            categories.push(Number(catFormatted[i]))
          }  
          var position = dataRangeArray[h + frozenRows][dictio["position"]]
          if (position != ""){
            Number(position);
          }
          else{
            position = ""
          }
          
          var bundle = dataRangeArray[h + frozenRows][dictio["bundle_composition"]]
          if (bundle != ""){
            var getBundle = bundle.split(",",15)
            for (var i = 0; i < getBundle.length; ++i) {           
              var lot = getBundle[i].split(":",13)
                bundle_composition.push({ ean13: lot[0] , quantity: Number(lot[1]) })
            }
          }
    
          items.push(
          new ProductsItems(
              Boolean(dataRangeArray[h + frozenRows][dictio["isActive"]]),
              typologie,
              Number(dataRangeArray[h + frozenRows][dictio["suggested_items"]]),
              position,
              categorieName,
              categories,
              String(dataRangeArray[h + frozenRows][dictio["condition"]]),
              String(dataRangeArray[h + frozenRows][dictio["name"]]),
              String(dataRangeArray[h + frozenRows][dictio["supplier_reference"]]),
              String(dataRangeArray[h + frozenRows][dictio["manufacturer_reference"]]),
              String(dataRangeArray[h + frozenRows][dictio["ean13"]]),
              String(dataRangeArray[h + frozenRows][dictio["marque"]]),
              Number(dataRangeArray[h + frozenRows][dictio["quantity"]]),
              Number(dataRangeArray[h + frozenRows][dictio["wholesale_price"]]),
              Number(dataRangeArray[h + frozenRows][dictio["discounted_price"]]),
              Number(dataRangeArray[h + frozenRows][dictio["ecotax"]]),
              Number(dataRangeArray[h + frozenRows][dictio["public_price"]]),
              Number(dataRangeArray[h + frozenRows][dictio["tax_rate"]]),
              Number(dataRangeArray[h + frozenRows][dictio["reparability_index_grade"]]),
              Boolean(dataRangeArray[h + frozenRows][dictio["reparability_index_mandatory"]]),
              String(dataRangeArray[h + frozenRows][dictio["reparability_index_criteria_grid"]]),
              Number(dataRangeArray[h + frozenRows][dictio["depth"]]),
              Number(dataRangeArray[h + frozenRows][dictio["width"]]),
              Number(dataRangeArray[h + frozenRows][dictio["height"]]),
              Number(dataRangeArray[h + frozenRows][dictio["weight"]]),
              String(dataRangeArray[h + frozenRows][dictio["short_description"]]),
              String(dataRangeArray[h + frozenRows][dictio["long_description"]]),
              String(dataRangeArray[h + frozenRows][dictio["images"]]),
              String(dataRangeArray[h + frozenRows][dictio["selling_points"]]),
              String(dataRangeArray[h + frozenRows][dictio["features"]]),
              String(dataRangeArray[h + frozenRows][dictio["specificities"]]),
              String(dataRangeArray[h + frozenRows][dictio["pictograms"]]),
              String(dataRangeArray[h + frozenRows][dictio["warranty"]]),
              String(dataRangeArray[h + frozenRows][dictio["videos"]]),
              String(dataRangeArray[h + frozenRows][dictio["packaging"]]),
              Number(dataRangeArray[h + frozenRows][dictio["size_guide"]]),
              bundle_composition,
              String(dataRangeArray[h + frozenRows][dictio["default_variant_ean13"]]),
              variantAttributes
            )
          )
      }
    //}
  }
  Logger.log(JSON.stringify(items));
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

  const req = new SyncProductEnrichementRequest(recipient, sale, items)
  //Logger.log(JSON.stringify(req));
  return JSON.stringify(req);
}
