function onOpen() {

  SpreadsheetApp.getUi()
    .createMenu('Matrice')
    .addItem('📗 Enrichir la matrice', 'sendEnrichmentRequest')
    .addItem('🔁 Synchroniser les navigations', 'synchroNavigation')
    .addItem('🍣 Synchroniser les produits', 'synchroProduit')
    .addToUi();
}
