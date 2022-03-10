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
  constructor(isActive, typeProduit,suggestedItem,position,categoryNames, categories, condition, name,supplierReference, manufacturerReference, ean, brand, quantity, wholesalePrice, discountedPrice,
 ecotax, publicPrice, taxRate, reparability_index_grade, reparability_index_mandatory, reparability_index_criteria_grid, depth, width, height, weight, short_description, long_description, images, selling_points, features, specificities, pictograms, warranty, videos, packaging, size_guide, bundleComposition,default_variant_ean13, variantAttributes) {
    this.is_active = isActive
    this.type = typeProduit
    this.suggested_items = []
    if (suggestedItem != ""){
      this.suggested_items.push(suggestedItem)
    }
    this.position = position
    this.category_names = []
    for (var h = 0; h < categoryNames.length; ++h) {
      this.category_names.push(categoryNames[h])
    }
    this.categories = []
      for (var i = 0; i < categories.length; ++i) {
      this.categories.push(categories[i])
    }   
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
    this.reparability_index_grade = reparability_index_grade
    this.reparability_index_mandatory = reparability_index_mandatory
    this.reparability_index_criteria_grid = reparability_index_criteria_grid
    this.depth = depth
    this.width = width
    this.height = height
    this.weight = weight
    this.short_description = short_description
    this.long_description = long_description
    this.images = []
    if (images != ""){
      this.images.push(images)
    } 
    this.selling_points = []
    if (selling_points != ""){
      this.selling_points.push(selling_points)
    } 
    this.features = features
    this.specificities = specificities
    this.pictograms = pictograms
    this.warranty = warranty
    this.videos = []
    if (videos != ""){
      this.videos.push(videos)
    }
    this.packaging = packaging
    this.size_guide = size_guide

    
    this.bundle_composition = []
    if (bundleComposition.length > 0){
      for (var h = 0; h < bundleComposition.length; ++h) {
        this.bundle_composition.push(bundleComposition[h])
      }
    }
    if(default_variant_ean13 != ""){
      this.default_variant_ean13 = default_variant_ean13
    }  
    this.variant_attributes = []
    for (var i = 0; i < variantAttributes.length; ++i) {
      if (!isObjEmpty(variantAttributes[i])){
        this.variant_attributes.push(variantAttributes[i])
      }
     
    } 

   }
   
 }

 class Sale {
   constructor(name, dateStart, dateEnd, idRootCategory, idSalesforce, idPrestashop, idMatrix) {
     this.sale_l10n = []
     this.sale_l10n.push({ iso_lang_code: "fr", name: name})
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
    this.ean13 =  ean
  }
}
