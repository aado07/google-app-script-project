
var scriptProperties = PropertiesService.getScriptProperties();
scriptProperties.setProperties({
  'SERVER_URL': 'https://x-api-sales-workflow-dev.ir-e1.eu1.cloudhub.io/sales/',
  'BASE_PATH_NAV': '/sync_navigations',
  'BASE_PATH_SALE_ITEMS': '/sync_sale_items',
  'ENV': 'dev',
  'client_id': '219774f6c1fc4ebabcfafc0e8e138ac8',
  'client_secret': '1b508B7da8364289A6f835a233cEfB7C'
});


function getFileContent() {
  var fileName = "config.json";
  var files = DriveApp.getFilesByName(fileName);
  if (files.hasNext()) {
      var file = files.next();
      var content = file.getBlob().getDataAsString();
      var json = JSON.parse(content);
      Logger.log(json);
    }
 }