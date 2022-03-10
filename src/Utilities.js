function sendNavigationSync() {
  lockMatrice();
}

function isObjEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function checkIfSaleStarted() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var datenow = Utilities.formatDate(new Date(), "GMT+1", "yyyy-MM-dd");
  var startDate = spreadsheet.getSheetByName("Vente").getRange(2, 2).getValue(); // date_start
  var endDate = spreadsheet.getSheetByName("Vente").getRange(2, 3).getValue(); // date_end
  var isVerified = false;
  if (startDate.valueOf() < datenow.valueOf() && endDate.valueOf() > datenow.valueOf() ) {
    isVerified = true;
  } else if (startDate.valueOf() > datenow.valueOf()){
    isVerified = false;
  }
  return isVerified;
}

function lockMatrice(){
  // Protection de toutes les feuilles de calcul 
  /*const sheetsToProtect = /^(Produits|Catégories|Vente|.*Data)$/i;
  const ss = SpreadsheetApp.getActive();
  const sheets = ss.getSheets()
    .filter(sheet => sheet.getName().match(sheetsToProtect));
  const protectedSheets = sheets
    .map(sheet => protectSheet_(sheet))
    .filter(sheet => sheet);
  ss.toast('sheetsToProtect matched ' + sheets.length + ' sheets. '
    + protectedSheets.length
    ? 'Successfully protected ' + protectedSheets.length + ' sheets: '
    + protectedSheets.map(sheet => sheet.getName()).join(', ')
    : ''
  );
  */
}

function unlockMatrice(){

  const sheetsToUnProtect = /^(Produits|Catégories|Vente|.*Data)$/i;
  const ss = SpreadsheetApp.getActive();
  const sheets = ss.getSheets()
    .filter(sheet => sheet.getName().match(sheetsToUnProtect));
  const protectedSheets = sheets
    .map(sheet => unprotectSheet_(sheet))
    .filter(sheet => sheet);
  ss.toast('sheetsToProtect matched ' + sheets.length + ' sheets. '
    + protectedSheets.length
    ? 'Successfully unprotected ' + protectedSheets.length + ' sheets: '
    + protectedSheets.map(sheet => sheet.getName()).join(', ')
    : ''
  );
  
}


function protectSheet_(sheet, exceptRanges, warningOnly) {

  const sheetUnprotectOK = unprotectSheet_(sheet);
  const protection = sheet.protect().setDescription('Protected by the protectSheets script');
  if (exceptRanges) {
    protection.setUnprotectedRanges(exceptRanges);
  }
  var me = Session.getEffectiveUser();
  protection.addEditor(me);
  if (warningOnly) {
    protection.setWarningOnly(true);
  } else {
    protection.removeEditors(protection.getEditors());
    if (protection.canDomainEdit()) {
      protection.setDomainEdit(false);
    }
  }
  return sheetUnprotectOK ? sheet : null;
}

function unprotectSheet_(sheet) {

  let rangeUnprotectOK = removeAllRangeProtections_(sheet);
  let sheetUnprotectOK = true;
  let protection = sheet.getProtections(SpreadsheetApp.ProtectionType.SHEET)[0];
  if (protection) {
    if (protection.canEdit()) {
      protection.remove();
    } else {
      sheetUnprotectOK = false;
    }
  }
  return rangeUnprotectOK && sheetUnprotectOK ? sheet : null;
}

function removeAllRangeProtections_(sheet) {
  let rangeUnprotectOK = true;
  const protections = sheet.getProtections(SpreadsheetApp.ProtectionType.RANGE);
  protections.forEach(function (protection) {
    if (protection.canEdit()) {
      protection.remove();
    } else {
      rangeUnprotectOK = false;
    }
  });
  return rangeUnprotectOK ? sheet : null;
}



//Fonction permettant de transformer un sheet en un objet JSON
function getJsonArrayFromData(data)
{
  var obj = {};
  var result = [];
  var headers = data[0];
  var cols = headers.length;
  var row = [];

  for (var i = 1, l = data.length; i < l; i++)
  {
    // get a row to fill the object
    row = data[i];
    // clear object
    obj = {};
    for (var col = 0; col < cols; col++) 
    {
      // fill object with new values
      obj[headers[col]] = row[col];    
    }
    // add object in a final result
    result.push(obj);  
  }
  
  return JSON.stringify(getJsonArrayFromData(result));  

}
