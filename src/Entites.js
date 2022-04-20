class MatrixEnrichementRequest {
  constructor(recipient, sale, saleItems) {
    this.recipient = []
    this.recipient.push({ contact: recipient.recipient, channel: recipient.channel })
    this.sale = sale
    this.sale_item = saleItems
  }

  addRecipient(recipient, channel) {
    this.recipients.push({ recipient: recipient, channel: channel })
  }
}
class SyncNavigationEnrichementRequest {
  constructor(recipient, sale, items) {
    this.recipient = []
    this.recipient.push({ contact: recipient.recipient, channel: recipient.channel })
    this.sale = sale
    this.items = items
  }

  addRecipient(recipient, channel) {
    this.recipients.push({ recipient: recipient, channel: channel })
  }
}

class SyncProductEnrichementRequest {
  constructor(recipient, sale, items) {
    this.recipient = []
    this.recipient.push({ contact: recipient.recipient, channel: recipient.channel })
    this.sale = sale
    this.product_items = items
  }

  addRecipient(recipient, channel) {
    this.recipients.push({ recipient: recipient, channel: channel })
  }
}

class NavigationItems {
  constructor(cat1, cat2, cat3, ean, position) {
    this.category1 = cat1
    this.category2 = cat2
    this.category3 = cat3
    this.ean13 = ean
    this.position = position
  }
}


class ProductsItems {
  constructor(isActive, typeProduit, suggestedItem, position, categoryNames, categoriesList, condition, name, supplierReference, manufacturerReference, ean, brand, quantity, wholesalePrice, discountedPrice,
    ecotax, publicPrice, taxRate, reparabilityIndexGrade, reparabilityIndexMandatory, reparabilityIndexCriteriaGrid, depth, width, height, weight, shortDescription, longDescription, imagesList, sellingPointsList, features, specificities, pictograms, warranty, videosList, packaging, sizeGuide, bundleCompositionList, defaultVariantEan13, variantAttributesList) {

    this.is_active = isActive
    this.type = typeProduit
    this.suggested_items = suggestedItem
    this.position = position
    this.category_names = categoryNames
    this.categories = categoriesList
    this.condition = condition
    this.name = name
    this.supplier_reference = supplierReference
    this.manufacturer_reference = manufacturerReference
    this.ean13 = ean
    this.brand = brand
    this.quantity = quantity
    this.wholesale_price = wholesalePrice
    this.discounted_price = discountedPrice
    this.ecotax = ecotax
    this.public_price = publicPrice
    this.tax_rate = taxRate
    this.reparability_index_grade = reparabilityIndexGrade
    this.reparability_index_mandatory = reparabilityIndexMandatory
    this.reparability_index_criteria_grid = reparabilityIndexCriteriaGrid
    this.depth = depth
    this.width = width
    this.height = height
    this.weight = weight
    this.short_description = shortDescription
    this.long_description = longDescription
    this.images = imagesList 
    this.selling_points = sellingPointsList
    this.features = features
    this.specificities = specificities
    this.pictograms = pictograms
    this.warranty = warranty
    this.videos = videosList
    this.packaging = packaging
    this.size_guide = sizeGuide
    if(bundleCompositionList.length > 0){
      this.bundle_composition = bundleCompositionList
    }
    else{this.bundle_composition = []}

    // Ne pas renvoyer l'objet s'il est null
    if (defaultVariantEan13 != ""){
      this.default_variant_ean13 = defaultVariantEan13
    }
    
    if(variantAttributesList.length > 0){
      this.variant_attributes = variantAttributesList
    }
    else{this.variant_attributes = []}

  }
  
}

class Sale {
  constructor(name, dateStart, dateEnd, idRootCategory, idSalesforce, idPrestashop, idMatrix) {
    this.sale_l10n = []
    this.sale_l10n.push({ iso_lang_code: "fr", name: name })
    this.date_start = dateStart
    this.date_end = dateEnd
    this.id_root_category = idRootCategory
    this.id_sale = idSalesforce
    this.id_sale_prestashop = idPrestashop
    this.id_sale_matrix = idMatrix
  }
}

class SaleItem {
  constructor(isActive, productName, ean, supplierReference) {
    this.is_active = isActive
    this.catalog_item = new CatalogItem(productName, ean)
    this.supplier_reference = supplierReference
  }
}

class CatalogItem {
  constructor(productName, ean) {
    this.catalog_item_l10n = []
    this.catalog_item_l10n.push({ name: productName, iso_lang_code: "fr" })
    this.ean13 = ean
  }
}