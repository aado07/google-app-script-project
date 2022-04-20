function synchroProduct() {

  setGlobalPropeties();

  var ui = SpreadsheetApp.getUi(); // Same variations.

  if (checkIfSaleStarted()) {
    ui.alert('Alerte', 'La vente est en cours, merci d’apporter les modifications de navigations directement sur Prestashop.', ui.ButtonSet.OK);
  }
  else {
    // Sale is started
    sendNavigationSync();
    callRequestProduct();
  }
}

function callRequestProduct() {

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var documentProperties = PropertiesService.getDocumentProperties();
  var idSale = String(spreadsheet.getSheetByName("Vente").getRange(2, 5).getValue())


  // set Properties variable
  var clientId = documentProperties.getProperty("client_id");
  var clientSecret = documentProperties.getProperty("client_secret");
  var urlParam = documentProperties.getProperty("SERVER_URL");
  var basePath = documentProperties.getProperty("BASE_PATH_SALE_ITEMS");


  var messageText = "";
  var ui = SpreadsheetApp.getUi(); // Same variations.

  try {
    var url = urlParam + idSale + basePath;
    var options = {
      "method": "post",
      "headers": {
        "Content-Type": "application/json",
        "client_id": clientId,
        "client_secret": clientSecret
      },
      "payload": makeProductJson(),
      "muteHttpExceptions": true
    };

    var response = UrlFetchApp.fetch(url, options);
    var codeResult = Number(response.getResponseCode());

    //Verified success response 
    if (codeResult === 200) {
      ui.alert(
        '🗸 Succès',
        'La synchronisation des produits a été éffectuée avec succès',
        ui.ButtonSet.OK);
    }
    else {

      var messageContent = JSON.parse(response.getContentText());
      if (!isObjEmpty(messageContent)) {
        if (!isObjEmpty(messageContent.error)) {
          var type = messageContent.error[0].type;
          if (type === "HTTP:INTERNAL_SERVER_ERROR") { messageText = 'MESSAGE : ' + messageContent.error[0].message; }
          if (type === "HTTP:BAD_REQUEST") {  messageText = 'MESSAGE : ' + messageContent.error[0].message + '\n' + '\n' + 'DESCRIPTION : ' + messageContent.error[0].description[0].type + '\n' + messageContent.error[0].description[0].message + '\n' +  messageContent.error[0].description[0].description; }
          if (type === "APIKIT:BAD_REQUEST") { messageText = 'MESSAGE : ' + messageContent.error[0].message; }
          if (type === "FUNCTIONNAL:BAD_REQUEST") { messageText = 'MESSAGE : ' + messageContent.error[0].message + '\n' + '\n' + 'DESCRIPTION : ' + messageContent.error[0].description; }

          ui.alert(
            '📛 Erreur ' + ': ' + type + ' (' + codeResult + ')',
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
    "name": 8,
    "default_variant_ean13": 9,
    "declinaison1": 10,
    "declinaison2": 11,
    "declinaison3": 12,
    "bundle_composition": 13,
    "supplier_reference": 14,
    "manufacturer_reference": 15,
    "type": 17,
    "ean13": 19,
    "marque": 20,
    "quantity": 27,
    "wholesale_price": 32,
    "discounted_price": 36,
    "ecotax": 39,
    "public_price": 42,
    "tax_rate": 54,
    "reparability_index_grade": 63,
    "reparability_index_mandatory": 64,
    "reparability_index_criteria_grid": 65,
    "depth": 66,
    "width": 67,
    "height": 68,
    "weight": 69,
    "short_description": 81,
    "long_description": 82,
    "images": 83,
    "selling_points": 84,
    "features": 85,
    "specificities": 86,
    "pictograms": 87,
    "warranty": 88,
    "videos": 89,
    "packaging": 90,
    "size_guide": 91
  }


  var frozenRows = spreadsheet.getSheetByName("Produits").getFrozenRows();
  var dataRange = spreadsheet.getSheetByName("Produits").getDataRange();
  var dataRangeArray = dataRange.getValues();
  var dataHeight = dataRange.getHeight() - frozenRows;
  var items = []

  try {
    for (var h = 0; h < dataHeight; ++h) {

      var categorieName = []
      var bundleComposition = []
      var categories = []
      var variantAttributes = []
      var suggestedItems = []
      var sellingPt = []
      if (dataRangeArray[h + frozenRows][dictio["isActive"]] == "0" ||
        dataRangeArray[h + frozenRows][dictio["isActive"]] == "1") {

        var typologie = dataRangeArray[h + frozenRows][dictio["type"]];

        //formating variantAttributes array with all declinaison column sheet
        for (var x = 1; x <= 3; ++x) {
          categorieName.push({ "fr": String(dataRangeArray[h + frozenRows][dictio["category" + x]]) }) 
        }

        //formating variantAttributes array with all declinaison column sheet
        for (var i = 1; i <= 3; ++i) {
          var declinaison = dataRangeArray[h + frozenRows][dictio["declinaison" + i]].split(":")
          if (declinaison.length > 1) {
            variantAttributes.push({ "type": declinaison[0], "value": declinaison[1] })
          }
        }
        //construct suggestedItems array from lien compatibilité column sheet
        var idProduct = dataRangeArray[h + frozenRows][dictio["suggested_items"]]
        if (idProduct != "") {
          var arrayIdProduct = idProduct.split(",");
          for (var i = 0; i < arrayIdProduct.length; ++i) {
            suggestedItems.push(Number(arrayIdProduct[i]))
          }

        }

        //construct sellingPoint array from Points Forts column sheet
        var sellingPoint = dataRangeArray[h + frozenRows][dictio["selling_points"]]
        if (sellingPoint != "") {
          var arraySellingPoint = sellingPoint.split("|");
          for (var i = 0; i < arraySellingPoint.length; ++i) {
            sellingPt.push(String(arraySellingPoint[i]))
          }
        } else { sellingPt = [] }

        //construct categories array from categories column sheet
        var getCategories = dataRangeArray[h + frozenRows][dictio["categories"]]
        if (getCategories != "") {
          var catFormatted = getCategories.replace(/\s/g, "").split(",", 8);
          for (var i = 0; i < catFormatted.length; ++i) {
            categories.push(Number(catFormatted[i]))
          }
        }

        //get position from ordre produit column sheet
        var position = dataRangeArray[h + frozenRows][dictio["position"]]
        if (position != "") { position = Number(position); }

        //construct bundle_composition array from bundle_composition column sheet
        var bundle = dataRangeArray[h + frozenRows][dictio["bundle_composition"]]
        if (bundle != "") {
          var getBundle = bundle.split(",", 15)
          for (var i = 0; i < getBundle.length; ++i) {
            var lot = getBundle[i].split(":", 13)
            bundleComposition.push({ ean13: lot[0], quantity: Number(lot[1]) })
          }
        }

        var images = dataRangeArray[h + frozenRows][dictio["images"]]
        if (images != "") {
          images = images.split(",");
        } else { images = [] }

        var videos = dataRangeArray[h + frozenRows][dictio["videos"]]
        if (videos != "") {
          videos = videos.split(",");
        } else { videos = [] }

        //Construct product_items object
        items.push(
          new ProductsItems(
            Boolean(dataRangeArray[h + frozenRows][dictio["isActive"]]),
            typologie,
            suggestedItems,
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
            images,
            sellingPt,
            String(dataRangeArray[h + frozenRows][dictio["features"]]),
            String(dataRangeArray[h + frozenRows][dictio["specificities"]]),
            String(dataRangeArray[h + frozenRows][dictio["pictograms"]]),
            String(dataRangeArray[h + frozenRows][dictio["warranty"]]),
            videos,
            String(dataRangeArray[h + frozenRows][dictio["packaging"]]),
            Number(dataRangeArray[h + frozenRows][dictio["size_guide"]]),
            bundleComposition,
            String(dataRangeArray[h + frozenRows][dictio["default_variant_ean13"]]),
            variantAttributes
          )
        )
      }
    }

  } catch (err) {
    ui.alert(
      '📛 Failed with error %s',
      err.message,
      ui.ButtonSet.OK);
  }
  Logger.log(JSON.stringify(items))
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
  return JSON.stringify(req);
}
