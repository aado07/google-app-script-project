

function getFileContent() {
  var fileName = "app-script-config-dev.properties";
  var files = DriveApp.getFilesByName(fileName);
  try {
    if (files.hasNext()) {
      var file = files.next();
      var content = file.getBlob().getDataAsString();
      var json = JSON.parse("{" + content.replace("\"\"", "") + "}");
    }
    return json;
  } catch (err) {
  }
}

function setGlobalPropeties() {

  var documentProperties = PropertiesService.getDocumentProperties();

  documentProperties.setProperty('SERVER_URL_SALE', getFileContent().server_url_sale);
  documentProperties.setProperty('SERVER_URL', getFileContent().server_url);
  documentProperties.setProperty('BASE_PATH_NAV', getFileContent().base_path_nav);
  documentProperties.setProperty('BASE_PATH_SALE_ITEMS', getFileContent().base_path_sale_items);
  documentProperties.setProperty('BASE_PATH_SALE_ITEMS_SYNC_HIST', getFileContent().base_path_sale_items_sync_hist);
  documentProperties.setProperty('ENV', getFileContent().env);
  documentProperties.setProperty('client_id', getFileContent().client_id);
  documentProperties.setProperty('client_secret', getFileContent().client_secret);


}