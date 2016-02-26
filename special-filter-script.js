//here si where the magic happnes and where Im stuck D: I cant seem to find a good way to show the second page, and the first page randoms the products for the first 21 products that are selected.
  $(function($) {

  	//Function to get the url of the collection you are filtering.
    function doProducts(collection, limit, page) {
      collection = typeof collection !== 'undefined' ? collection : 'books';
      limit = typeof limit !== 'undefined' ? limit : 250;
      var vendorTag = [];
      $('[name=min]:checked').each(function() {
        if ($(this).val()) {
          vendorTag.push($(this).val());
        }
      });
      var url = 'http://bebe2go.myshopify.com/collections/' + collection + '/products.json?limit=' + limit + '&page=' + page;
      return url;
    }	
    
    Array.prototype.customIndexOf = function (searchElement, fromIndex) {
      return this.map(function (value) {
        return value.toLowerCase();
      }).indexOf(searchElement.toLowerCase(), fromIndex);
    };

    //Now this uses the filters made before to filter the list that is get by the ajax of products.
    var doFilter = function(data,min,max) {
      min = typeof min !== 'undefined' ? min : 0;
      max = typeof max !== 'undefined' ? max : 250;
      var newTags = [];
      var edadTags = [];
      var generoTags = [];
      //var maxrangeprice = 0;
      $('[name=edad]:checked').each(function() {
        if ($(this).val()) {
          edadTags.push($(this).val().toLowerCase());
        }
      });
      $('[name=genero]:checked').each(function() {
        if ($(this).val()) {
          generoTags.push($(this).val().toLowerCase());
        }
      });
      var marcasTags = [];
      $('[name=marcas]:checked').each(function() {
        if ($(this).val()) {
          marcasTags.push($(this).val().toLowerCase());
        }
      });
      var output = new Array();
      for (var i = 0; i < data.products.length; i++) {
        if (data.products[i].variants[0].price >= min && data.products[i].variants[0].price <= max) {
          if (marcasTags.length){
            var vendorFound = false;
            for (var ia = 0; ia < marcasTags.length; ia++) {
              if (data.products[i].vendor.toLowerCase() == marcasTags[ia]) {
                vendorFound = true;
                break;
              }
            }
            if (vendorFound) {
              if (edadTags.length || generoTags.length) {
                var typeTags = 0;
                if (edadTags.length){
                  var edadFound = false;
                  for (var ia = 0; ia < edadTags.length; ia++) {
                    if (data.products[i].tags.customIndexOf(edadTags[ia]) > -1) {
                      edadFound = true;
                      break;
                    }
                  }
                  typeTags = 1;
                }
                if (generoTags.length){
                  var generoFound = false;
                  for (var ie = 0; ia < generoTags.length; ie++) {
                    if (data.products[i].tags.customIndexOf(generoTags[ie]) > -1) {
                      generoFound = true;
                      break;
                    }
                  }
                  typeTags = 2;
                }
                if (typeTags == 1) {
                  if (edadFound) {
                    output.push(data.products[i]);
                  }
                } else {
                  if (edadFound && generoFound) {
                  	output.push(data.products[i]);
                  }
                }
              } else {
              	output.push(data.products[i]);
              }
            }
          } else if ( edadTags.length || generoTags.length ) {
            var typeTags = 0;
            if (edadTags.length){
              var edadFound = false;
              for (var ia = 0; ia < edadTags.length; ia++) {
                if (data.products[i].tags.customIndexOf(edadTags[ia]) > -1) {
                  edadFound = true;
                  break;
                }
              }
              typeTags = 1;
            }
            if (generoTags.length){
              var generoFound = false;
              for (var ie = 0; ie < generoTags.length; ie++) {
                if (data.products[i].tags.customIndexOf(generoTags[ie]) > -1) {
                  generoFound = true;
                  break;
                }
              }
              typeTags = 1;
            }
            if (typeTags == 1) {
              if (edadFound) {
                output.push(data.products[i]);
              }
            } else {
              if (edadFound && generoFound) {
                output.push(data.products[i]);
              }
            }
          } else {
          	output.push(data.products[i]);
          }
          
        }
      }
      //$('#minPriceInput').attr('max', maxrangeprice);
      //$('#maxPriceInput').attr('max', maxrangeprice);
      //$("#slider-range").slider("option", "min", maxrangeprice);
      return output;
    }

    //Not used but it could be to get the quick view of the porduct hangles beeing sent in the variable.
    function getQuickviewProduct(productHandle){
      $.ajax({
        type: 'GET',
        url: "/products/" + productHandle + "?view=quick" ,
        dataType: 'html',
        async: false,
        success: function (data) {
          return data;
        }
      });
    }

    //This is the call which starts everything, its fired by the submit button or the enter on any of the input boxes.
    $('#filter-form').on('submit',function(e) {
      e.preventDefault();
      //Min Price of product
      var min = parseInt($(this).find('[name=min]').val());
      //Max Price of product
      var max = parseInt($(this).find('[name=max]').val());
      //Name of the collection
      var collection = $(this).find('[name=collection]').val();
      //Starting page
      var page = 1;
      //Gets URL of collection and page where it should be
      var json = doProducts(collection, 21, page);
      //Loading image
      var imgsrc = 'https://cdn.shopify.com/s/files/1/0154/0015/files/loading.gif?14759290615479578196';
      var htmlProduct = "";
      //This will be the counter that will lead to the max number of product I want shown at once
      var cont_max_prod = 0;
      //Current number of products passed through the whole while
      var current_product = 0;
      //Total products there is in a collection
      var total_product = 0;

      //This ajax gets the total products of the collection.
      $.ajax({ 
        type: 'GET',
        url: 'http://bebe2go.myshopify.com/collections/' + collection + '.json' ,
        dataType: 'jsonp',
        async: false,
        beforeSend: function() {
          $('#productRow').append('<img id="product-filter-img" class="img-responsive" src=\"' + imgsrc + '" />');
        },
        success: function (data) {
          //I get the total number of products on the collection
          total_product = data.collection.products_count;
		
          //Errase the products to make space to put the new products.
          $('#productRow').html('');
          $('#moreProducts').remove();
          $('.product').remove();

          }
      });
      //This while goes through all the existing products, page by page. Or it will stop if it gets to 21 products shown printed on the collection page.
      while ( current_product <= total_product && cont_max_prod <= 21 ) {
      	//ajax to get all the products from the collection.
        if ( cont_max_prod <= 21 ) {
          $.ajax({
            type: 'GET',
            url: json,
            dataType: 'jsonp',
            async: false,
            success: function (data) {
              //Call for doFilter function to filter the products from the page its going through
              var output = doFilter(data,min,max);
              //Check if there are products after all the filters and pages have passed. If there are no products it show a message saying no product was found
              if (output.length == 0) {
                $('#productRow').append('<div class="col-md-12 col-sm-12 product"><h3 style="text-align:center;">¡No se encontro ningun producto bajo esos filtros! D: Intenta de nuevo.</h3></div>');
              } else (output.length != 0) {
                //Go through all the filtered list of products in the page.
                for (var i = 0; ((i < output.length)); i++) {
                  var item = output[i];

                  //Ajax to get 
                  $.ajax({
                    type: 'GET',
                    url: "/products/" + item.handle + "?view=quick" ,
                    dataType: 'html',
                    async: false,
                    success: function (data) {
                    	//If 
                      if (cont_max_prod <= 20) {
                        htmlProduct = data;
                        $('#productRow').append('<div class="col-md-4 col-sm-6 product">' + htmlProduct + '</div>');
                      } 
                      cont_max_prod ++;
                      if (cont_max_prod == 21) {
                        page ++;
                        $('#productRow').append('<div id="more-filtered-products" class="product row"><div class="col-xl-12 col-sm-12" style="text-align:center;"><button class="more-filtered-products btn btn-default" onclick="getProductList(' + page + ');">Mostrar mas productos</button></div></div>');
                      }
                    }
                  });
                }
              }
            }
          });

          if (page == 1) {
            $('#productRow').find('#product-filter-img').remove();
            //$('#more-filtered-products').remove();
          }
          page = page + 1; 
          json = doProducts(collection, 21, page);
          current_product = current_product + 21;
        }
      }
      //This alert is for me to know which product im in. 
      alert('Page: ' + page + ' Products: ' + current_product + ' Total Products: ' + total_product);
        
    });
    
  });
  
  //I tried calling the funtions above but it would not work. And if I set them up outside the jquery funtion they would stop working D:
  function doProductsa(collection, limit, page) {
    collection = typeof collection !== 'undefined' ? collection : 'books';
    limit = typeof limit !== 'undefined' ? limit : 250;
    page = typeof page !== 'undefined' ? page : 2;
    var vendorTag = [];
    $('[name=min]:checked').each(function() {
      if ($(this).val()) {
        vendorTag.push($(this).val());
      }
    });
    var url = 'http://bebe2go.myshopify.com/collections/' + collection + '/products.json?limit=' + limit + '&page=' + page;
    return url;
  }

  var doFilters = function(data,min,max) {
    min = typeof min !== 'undefined' ? min : 0;
    max = typeof max !== 'undefined' ? max : 250;
    var newTags = [];
    var edadTags = [];
    var generoTags = [];
    //var maxrangeprice = 0;
    $('[name=edad]:checked').each(function() {
      if ($(this).val()) {
        edadTags.push($(this).val().toLowerCase());
      }
    });
    $('[name=genero]:checked').each(function() {
      if ($(this).val()) {
        generoTags.push($(this).val().toLowerCase());
      }
    });
    var marcasTags = [];
    $('[name=marcas]:checked').each(function() {
      if ($(this).val()) {
        marcasTags.push($(this).val().toLowerCase());
      }
    });
    var output = new Array();
    for (var i = 0; i < data.products.length; i++) {
      if (data.products[i].variants[0].price >= min && data.products[i].variants[0].price <= max) {
        if (marcasTags.length){
          var vendorFound = false;
          for (var ia = 0; ia < marcasTags.length; ia++) {
            if (data.products[i].vendor.toLowerCase() == marcasTags[ia]) {
              vendorFound = true;
              break;
            }
          }
          if (vendorFound) {
            if (edadTags.length || generoTags.length) {
              var typeTags = 0;
              if (edadTags.length){
                var edadFound = false;
                for (var ia = 0; ia < edadTags.length; ia++) {
                  if (data.products[i].tags.customIndexOf(edadTags[ia]) > -1) {
                    edadFound = true;
                    break;
                  }
                }
                typeTags = 1;
              }
              if (generoTags.length){
                var generoFound = false;
                for (var ie = 0; ia < generoTags.length; ie++) {
                  if (data.products[i].tags.customIndexOf(generoTags[ie]) > -1) {
                    generoFound = true;
                    break;
                  }
                }
                typeTags = 2;
              }
              if (typeTags == 1) {
                if (edadFound) {
                  output.push(data.products[i]);
                }
              } else {
                if (edadFound && generoFound) {
                  output.push(data.products[i]);
                }
              }
            } else {
              output.push(data.products[i]);
            }
          }
        } else if ( edadTags.length || generoTags.length ) {
          var typeTags = 0;
          if (edadTags.length){
            var edadFound = false;
            for (var ia = 0; ia < edadTags.length; ia++) {
              if (data.products[i].tags.customIndexOf(edadTags[ia]) > -1) {
                edadFound = true;
                break;
              }
            }
            typeTags = 1;
          }
          if (generoTags.length){
            var generoFound = false;
            for (var ie = 0; ia < generoTags.length; ie++) {
              if (data.products[i].tags.customIndexOf(generoTags[ie]) > -1) {
                generoFound = true;
                break;
              }
            }
            typeTags = 2;
          }
          if (typeTags == 1) {
            if (edadFound) {
              output.push(data.products[i]);
            }
          } else {
            if (edadFound && generoFound) {
              output.push(data.products[i]);
            }
          }
        } else {
          output.push(data.products[i]);
        }

      }
    }
    //$('#minPriceInput').attr('max', maxrangeprice);
    //$('#maxPriceInput').attr('max', maxrangeprice);
    //$("#slider-range").slider("option", "min", maxrangeprice);
    return output;
  }
  
  function getProductList(page) {
    $('#more-filtered-products').remove();
    //Min Price of product
    var min = parseInt($('#filter-form').find('[name=min]').val());
    //Max Price of product
    var max = parseInt($('#filter-form').find('[name=max]').val());
    //Name of the collection
    var collection = $('#filter-form').find('[name=collection]').val();
    //Starting page
    page = typeof page !== 'undefined' ? page : 2;
    //Gets URL of collection and page where it should be
    var json = doProductsa(collection, 21, page);
    var imgsrc = 'https://cdn.shopify.com/s/files/1/0154/0015/files/loading.gif?14759290615479578196';
    var htmlProduct = "";
    //This will be the counter that will lead to the max number of product I want shown at once
    var cont_max_prod = 0;
    //Current number of products passed through
    var current_product = 0;
    var current_product_ajax = 0;
    //Total products there is in a collection
    var total_product = 0;
    $.ajax({ 
      type: 'GET',
      url: 'http://bebe2go.myshopify.com/collections/' + collection + '.json' ,
      dataType: 'jsonp',
      beforeSend: function() {
        $('#productRow').append('<img id="product-filter-img" class="img-responsive" src=\"' + imgsrc + '" />');
      },
      success: function (data) {
        //I get the total number of products on the collection
        total_product = data.collection.products_count;
        $('#product-filter-img').remove();

        }
    });
    //This while goes through all the existing products, page by page. Or it will stop if it gets to 21 products shown.
    while ( current_product <= total_product && cont_max_prod <= 21 ) {
      if ( cont_max_prod <= 21 ) {
        $.ajax({
          type: 'GET',
          url: json,
          dataType: 'jsonp',
          success: function (data) {
            //Call for a function to filter the products from the page its going through
            var output = doFilters(data,min,max);
            //Check if there are products after all the filters and pages have passed. If there are no products it show a message saying no product was found
            if (output.length == 0 && current_product_ajax >= total_product) {
              $('#productRow').append('<div class="col-md-12 col-sm-12 product"><h3 style="text-align:center;">¡No se encontro ningun producto bajo esos filtros! D: Intenta de nuevo.</h3></div>');
            } else if (output.length != 0) {
              //Go through all the filtered list of products in the page.
              for (var i = 0; ((i < output.length)); i++) {
                var item = output[i];
                $.ajax({
                  type: 'GET',
                  url: "/products/" + item.handle + "?view=quick" ,
                  dataType: 'html',
                  success: function (data) {
                    if (cont_max_prod <= 20) {
                      htmlProduct = data;
                      $('#productRow').append('<div class="col-md-4 col-sm-6 product">' + htmlProduct + '</div>');
                    }  
                    cont_max_prod ++;
                    if (cont_max_prod == 21) {
                      page ++;
                      $('#productRow').append('<div id="more-filtered-products" class="product row"><div class="col-xl-12 col-sm-12" style="text-align:center;"><button class="more-filtered-products btn btn-default" onclick="getProductList(' + page + ');">Mostrar mas productos</button></div></div>');
                    }
                  }
                });
              }
            }
            current_product_ajax = current_product_ajax + 21;
          }
        });
        if (page == 1) {
          $('#productRow').find('#product-filter-img').remove();
          //$('#more-filtered-products').remove();
        }
        page = page + 1; 
        json = doProductsa(collection, 21, page);
        current_product = current_product + 21;
      }
    }
  }


$(function() {

var top_price = {{ top_price }} / 100;

var range_step = Math.round(top_price / 5);

$(".slider").slider({
  min: 0,
  max: top_price,
  values: [ 0, top_price ],
  range: true, 
  step: range_step,
  slide: function( event, ui ) {
    $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
    $('#minPriceInput').val(ui.values[ 0 ]);
    $('#maxPriceInput').val(ui.values[ 1 ]);
  }
})
.slider("pips", {
    rest: "label",
    labels: { first: "Min", last: "Max" }
})
.slider("float");

$('#minPriceInput').change(function() {
  $( "#amount" ).val( "$" + $('#minPriceInput').val() + " - $" + $('#maxPriceInput').val() );
  $(".slider").slider('values', 0, $('#minPriceInput').val());
});
$('#maxPriceInput').change(function() {
  $( "#amount" ).val( "$" + $('#minPriceInput').val() + " - $" + $('#maxPriceInput').val() );
  $(".slider").slider('values', 1, $('#maxPriceInput').val());
});
$( "#amount" ).val( "$" + $( ".slider" ).slider( "values", 0 ) +
  " - $" + $( ".slider" ).slider( "values", 1 ) );
});