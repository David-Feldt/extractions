/* eslint-disable indent */
/* eslint-disable linebreak-style */
/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
// Create a reference with an initial file path and name
//require('dotenv').config(); pain in the ass I don think scripts are modules

Extractions.prototype.initTemplates = function() {
  this.templates = {};

  var that = this;
  document.querySelectorAll('.template').forEach(function(el) {
    that.templates[el.getAttribute('id')] = el;
  });
};

Extractions.prototype.viewHome = function() {
  this.getAllShops();
};

Extractions.prototype.viewList = function(filters, filter_description) {
  if (!filter_description) {
    filter_description = 'find the coffee shop for your needs!';
  }
  
  console.log("viewlist filters", filters);

  var mainEl = this.renderTemplate('main-adjusted');
  var headerEl = this.renderTemplate('header-base', {
    hasSectionHeader: true
  });

  this.replaceElement(
    headerEl.querySelector('#section-header'),
    this.renderTemplate('filter-display', {
      filter_description:filter_description
    })
  );

  this.replaceElement(document.querySelector('.header'), headerEl);
  this.replaceElement(document.querySelector('main'), mainEl);
  // this.dialogs.filter = new mdc.dialog.MDCDialog(document.querySelector('#dialog-filter-all'));
  console.log("dialogs filter: ", this.dialogs.filter);
  var that = this;
  headerEl.querySelector('#show-filters').addEventListener('click', function() {
    that.dialogs.filter.show();
  });
  console.log("View list before renderer");
  var renderer = {
    remove: function(doc) {
      var locationCardToDelete = mainEl.querySelector('#doc-' + doc.id);
      if (locationCardToDelete) {
        mainEl.querySelector('#cards').removeChild(locationCardToDelete.parentNode);
      }

      return;
    },
    display: function(doc) {
      var data = doc.data();
      data['.id'] = doc.id;
      data['go_to_shop'] = function() {
        that.router.navigate('/shops/' + doc.id);
      };
  
      var el = that.renderTemplate('shop-card', data);
      // el.querySelector('.rating').append(that.renderRating(data.avgRating));
      // el.querySelector('.price').append(that.renderPrice(data.price));
      // Setting the id allows to locating the individual shop card
      el.querySelector('.location-card').id = 'doc-' + doc.id;
  
      var existingLocationCard = mainEl.querySelector('#doc-' + doc.id);
      if (existingLocationCard) {
        // modify
        existingLocationCard.parentNode.before(el);
        mainEl.querySelector('#cards').removeChild(existingLocationCard.parentNode);
      } else {
        // add
        mainEl.querySelector('#cards').append(el);
      }
    },
    empty: function() {
      var headerEl = that.renderTemplate('header-base', {
        hasSectionHeader: true
      });
      console.log('inside empty');
      var noResultsEl = that.renderTemplate('no-results');

      that.replaceElement(
        headerEl.querySelector('#section-header'),
        that.renderTemplate('filter-display', {
          filter_description: filter_description
        })
      );

      headerEl.querySelector('#show-filters').addEventListener('click', function() {
        that.dialogs.filter.show();
      });

      that.replaceElement(document.querySelector('.header'), headerEl);
      that.replaceElement(document.querySelector('main'), noResultsEl);
      return;
    }
  };

  if (filters.city || filters.category || filters.price || filters.sort !== 'Rating' ) {
    this.getFilteredShops({
      city: filters.city || 'Any',
      category: filters.category || 'Any',
      price: filters.price || 'Any',
      sort: filters.sort
    }, renderer);
    console.log("Get filtered shops");
  } else {
    this.getAllShops(renderer);
    console.log("Get all shops");
  }

  console.log("Vew list before mdctoolbar");
  console.log(document.querySelector('.mdc-toolbar'));
  var toolbar = mdc.toolbar.MDCToolbar.attachTo(document.querySelector('.mdc-toolbar'));
  console.log("Failig?");
  toolbar.fixedAdjustElement = document.querySelector('.mdc-toolbar-fixed-adjust');
  console.log("View list done - before mdc auto");
  mdc.autoInit();
  console.log("View list done");
};

Extractions.prototype.viewSetup = function() {
  var headerEl = this.renderTemplate('header-base', {
    hasSectionHeader: false
  });

  var config = this.getFirebaseConfig();
  var noShopsEl = this.renderTemplate('no-shops', config);

  var button = noShopsEl.querySelector('#add_mock_data');
  var addingMockData = false;

  var that = this;
  button.addEventListener('click', function(event) {
    if (addingMockData) {
      return;
    }
    addingMockData = true;

    event.target.style.opacity = '0.4';
    event.target.innerText = 'Please wait...';

    that.addMockShops().then(function() {
      that.rerender();
    });
  });

  this.replaceElement(document.querySelector('.header'), headerEl);
  this.replaceElement(document.querySelector('main'), noShopsEl);

  firebase
    .firestore()
    .collection('shops')
    .limit(1)
    .onSnapshot(function(snapshot) {
      if (snapshot.size && !addingMockData) {
        that.router.navigate('/');
      }
    });
};

Extractions.prototype.initReviewDialog = function() {
  var dialog = document.querySelector('#dialog-add-review');
  this.dialogs.add_review = new mdc.dialog.MDCDialog(dialog);

  var that = this;
  this.dialogs.add_review.listen('MDCDialog:accept', function() {
    var pathname = that.getCleanPath(document.location.pathname);
    var id = pathname.split('/')[2];

    that.addRating(id, {
      rating: rating,
      text: dialog.querySelector('#text').value,
      userName: 'Anonymous (Web)',
      timestamp: new Date(),
      userId: firebase.auth().currentUser.uid
    }).then(function() {
      that.rerender();
    });
  });

  var rating = 0;

  dialog.querySelectorAll('.star-input i').forEach(function(el) {
    var rate = function() {
      var after = false;
      rating = 0;
      [].slice.call(el.parentNode.children).forEach(function(child) {
        if (!after) {
          rating++;
          child.innerText = 'star';
        } else {
          child.innerText = 'star_border';
        }
        after = after || child.isSameNode(el);
      });
    };
    el.addEventListener('mouseover', rate);
  });
};

Extractions.prototype.initFilterDialog = function() {
  // TODO: Reset filter dialog to init state on close.
  this.dialogs.filter = new mdc.dialog.MDCDialog(document.querySelector('#dialog-filter-all'));
  console.log("Mom solved the problem");
  console.log("dialogs filter: ", this.dialogs.filter);
  var that = this;
  this.dialogs.filter.listen('MDCDialog:accept', function() {
    that.updateQuery(that.filters);
  });
  var dialog = document.querySelector('aside');
  var pages = dialog.querySelectorAll('.page');

  this.replaceElement(
    dialog.querySelector('#category-list'),
    this.renderTemplate('item-list', { items: ['Any'].concat(this.data.categories) })
  );

  this.replaceElement(
    dialog.querySelector('#city-list'),
    this.renderTemplate('item-list', { items: ['Any'].concat(this.data.cities) })
  );

  var renderAllList = function() {
    that.replaceElement(
      dialog.querySelector('#all-filters-list'),
      that.renderTemplate('all-filters-list', that.filters)
    );

    dialog.querySelectorAll('#page-all .mdc-list-item').forEach(function(el) {
      el.addEventListener('click', function() {
        var id = el.id.split('-').slice(1).join('-');
        displaySection(id);
      });
    });
  };

  var displaySection = function(id) {
    if (id === 'page-all') {
      renderAllList();
    }

    pages.forEach(function(sel) {
      if (sel.id === id) {
        sel.style.display = 'block';
      } else {
        sel.style.display = 'none';
      }
    });
  };

  pages.forEach(function(sel) {
    var type = sel.id.split('-')[1];
    if (type === 'all') {
      return;
    }

    sel.querySelectorAll('.mdc-list-item').forEach(function(el) {
      el.addEventListener('click', function() {
        that.filters[type] = el.innerText.trim() === 'Any'? '' : el.innerText.trim();
        displaySection('page-all');
      });
    });
  });

  displaySection('page-all');
  dialog.querySelectorAll('.back').forEach(function(el) {
    el.addEventListener('click', function() {
      displaySection('page-all');
    });
  });
};

Extractions.prototype.updateQuery = function(filters) {
  
  filters.sort = "";
  console.log("mom find filters: ", filters);
  
  var query_description = '';

  if (filters.category !== '') {
    query_description += filters.category + ' places';
  } else {
    query_description += 'any shop';
  }

  if (filters.city !== '') {
    query_description += ' in ' + filters.city;
  } else {
    query_description += ' located anywhere';
  }

  if (filters.price !== '') {
    query_description += ' with a price of ' + filters.price;
  } else {
    query_description += ' with any price';
  }

  if (filters.sort === 'Rating') {
    query_description += ' sorted by rating';
  } else if (filters.sort === 'Reviews') {
    query_description += ' sorted by # of reviews';
  }
  console.log("updateQuer - before view list")
  this.viewList(filters, query_description);
  console.log("updateQuer - after view list")
};

Extractions.prototype.viewShop = function(id) {
  var sectionHeaderEl;
  var mainEl;

  var that = this;
  return this.getShop(id)
    .then(function(doc) {
      var data = doc.data();
      var dialog =  that.dialogs.add_review;

      data.show_add_review = function() {
        // Reset the state before showing the dialog
        dialog.root_.querySelector('#text').value = '';
        dialog.root_.querySelectorAll('.star-input i').forEach(function(el) {
          el.innerText = 'star_border';
        });

        dialog.show();
      };

      sectionHeaderEl = that.renderTemplate('shop-header', data);
      mainEl = that.renderTemplate('shop-body',data);
      console.log("this is data", data);
      console.log("UDAPTING");
      var placeId = doc.placeId;
      mainEl.querySelector('.coffee_price').append(that.renderPrice(data.coffee_price));
      mainEl.querySelector('.food_price').append(that.renderPrice(data.food_price));
      mainEl.querySelector('.quality').append(that.renderQuality(data.quality));
      mainEl.querySelector('.desserts').append(that.renderQuality(data.desserts));
      mainEl.querySelector('.meals').append(that.renderQuality(data.meals));
      mainEl.querySelector('.size').append(that.renderQuality(data.size));
      mainEl.querySelector('.unique').append(that.renderUnique(data.unique));
      mainEl.querySelector('.study').append(that.renderQuality(data.study));

      // TODO: INVOKE CLOUD FUNCTION TO GET PLACE DETAILS


      //

      // sectionHeaderEl
      //   .querySelector('.rating')
      //   .append(that.renderRating(data.avgRating));

      // sectionHeaderEl
      //   .querySelector('.price')
      //   .append(that.renderPrice(data.price));
      return doc.ref.collection('ratings').orderBy('timestamp', 'desc').get();
    })
    .then(function(ratings) {

      // if (ratings.size) {
      //   mainEl = that.renderTemplate('main');

      //   ratings.forEach(function(rating) {
      //     var data = rating.data();
      //     var el = that.renderTemplate('review-card', data);
      //     el.querySelector('.rating').append(that.renderRating(data.rating));
      //     mainEl.querySelector('#cards').append(el);
      //   });
      // } else {
      //   mainEl = that.renderTemplate('no-ratings', {
      //     add_mock_data: function() {
      //       that.addMockRatings(id).then(function() {
      //         that.rerender();
      //       });
      //     }
      //   });
      // }
      var headerEl = that.renderTemplate('header-base', {
        hasSectionHeader: true
      });

      that.replaceElement(document.querySelector('.header'), sectionHeaderEl);
      that.replaceElement(document.querySelector('main'), mainEl);
    })
    .then(function() {
      that.router.updatePageLinks();
    })
    .catch(function(err) {
      console.warn('Error rendering page', err);
    });
};

Extractions.prototype.renderTemplate = function(id, data) {
  var template = this.templates[id];
  var el = template.cloneNode(true);
  el.removeAttribute('hidden');
  this.render(el, data);
  return el;
};

Extractions.prototype.render = function(el, data) {
  if (!data) {
    return;
  }

  var that = this;
  var modifiers = {
    'data-fir-foreach': function(tel) {
      var field = tel.getAttribute('data-fir-foreach');
      var values = that.getDeepItem(data, field);

      values.forEach(function(value, index) {
        var cloneTel = tel.cloneNode(true);
        tel.parentNode.append(cloneTel);

        Object.keys(modifiers).forEach(function(selector) {
          var children = Array.prototype.slice.call(
            cloneTel.querySelectorAll('[' + selector + ']')
          );
          children.push(cloneTel);
          children.forEach(function(childEl) {
            var currentVal = childEl.getAttribute(selector);

            if (!currentVal) {
              return;
            }
            childEl.setAttribute(
              selector,
              currentVal.replace('~', field + '/' + index)
            );
          });
        });
      });

      tel.parentNode.removeChild(tel);
    },
    'data-fir-content': function(tel) {
      var field = tel.getAttribute('data-fir-content');
      tel.innerText = that.getDeepItem(data, field);
    },
    'data-fir-click': function(tel) {
      tel.addEventListener('click', function() {
        var field = tel.getAttribute('data-fir-click');
        that.getDeepItem(data, field)();
      });
    },
    'data-fir-if': function(tel) {
      var field = tel.getAttribute('data-fir-if');
      if (!that.getDeepItem(data, field)) {
        tel.style.display = 'none';
      }
    },
    'data-fir-if-not': function(tel) {
      var field = tel.getAttribute('data-fir-if-not');
      if (that.getDeepItem(data, field)) {
        tel.style.display = 'none';
      }
    },
    'data-fir-attr': function(tel) {
      var chunks = tel.getAttribute('data-fir-attr').split(':');
      var attr = chunks[0];
      var field = chunks[1];
      tel.setAttribute(attr, that.getDeepItem(data, field));
    },
    'data-fir-style': function(tel) {
      var chunks = tel.getAttribute('data-fir-style').split(':');
      var attr = chunks[0];
      var field = chunks[1];
      var value = that.getDeepItem(data, field);
      const pathReference = firebase.storage().ref(value);
      if (attr.toLowerCase() === 'backgroundimage') {
        pathReference.getDownloadURL().then(function(url) {
          value = 'url(' + url + ')';
          tel.style[attr] = value;
        }).catch(function(error) {
          console.log(error);
        });
      }
      tel.style[attr] = value;
    },
    'data-fir-foreach-style': function(tel) {
      var field = tel.getAttribute('data-fir-foreach-style');
      var values = that.getDeepItem(data, field);

      values.forEach(function(value, index) {
        var cloneTel = tel.cloneNode(true);
        tel.parentNode.append(cloneTel);

        Object.keys(modifiers).forEach(function(selector) {
          var children = Array.prototype.slice.call(
            cloneTel.querySelectorAll('[' + selector + ']')
          );
          children.push(cloneTel);
          children.forEach(function(childEl) {
            var currentVal = childEl.getAttribute(selector);

            if (!currentVal) {
              return;
            }
            childEl.setAttribute(
              selector,
              currentVal.replace('~', field + '/' + index)
            );
          });
        });
      });

      tel.parentNode.removeChild(tel);
    },
  };

  var preModifiers = ['data-fir-foreach'];

  preModifiers.forEach(function(selector) {
    var modifier = modifiers[selector];
    that.useModifier(el, selector, modifier);
  });

  Object.keys(modifiers).forEach(function(selector) {
    if (preModifiers.indexOf(selector) !== -1) {
      return;
    }

    var modifier = modifiers[selector];
    that.useModifier(el, selector, modifier);
  });
};

Extractions.prototype.useModifier = function(el, selector, modifier) {
  el.querySelectorAll('[' + selector + ']').forEach(modifier);
};

Extractions.prototype.getDeepItem = function(obj, path) {
  path.split('/').forEach(function(chunk) {
    obj = obj[chunk];
  });
  return obj;
};

Extractions.prototype.renderRating = function(rating) {
  var el = this.renderTemplate('rating', {});
  for (var r = 0; r < 5; r += 1) {
    var star;
    if (r < Math.floor(rating)) {
      star = this.renderTemplate('star-icon', {});
    } else {
      star = this.renderTemplate('star-border-icon', {});
    }
    el.append(star);
  }
  return el;
};

Extractions.prototype.renderTags = function(tags) {
  var el = this.renderTemplate('tags', {});
  for (var tag in tags) {
    //el.append(tag);
    el.append(this.renderTemplate('tag', { tag: tag }));
  }
  return el;
};

Extractions.prototype.renderPrice = function(price) {
  var el = this.renderTemplate('price', {});
  for (var r = 0; r < price; r += 1) {
    el.append('$');
  }
  return el;
};

Extractions.prototype.renderQuality = function(quality) {
  const ratings = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  var el = this.renderTemplate('quality', {});
  if (quality < 0) {
    el.append('N/A');
  } else{
    el.append(ratings[quality]);
  }
  return el;
};

Extractions.prototype.renderSize = function(size) {
  const sizes = ['Extra Small', 'Small', 'Medium', 'Large', 'Extra Large'];
  var el = this.renderTemplate('size', {});
  el.append(sizes[size]);
  return el;
};

Extractions.prototype.renderUnique = function(unique) {
  const categories = ['Boring', 'Average', 'Distinct','Noteworthy','Phenomenal'];
  var el = this.renderTemplate('unique', {});
  el.append(categories[unique]);
  return el;
};


Extractions.prototype.replaceElement = function(parent, content) {
  parent.innerHTML = '';
  parent.append(content);
};

Extractions.prototype.rerender = function() {
  this.router.navigate(document.location.pathname + '?' + new Date().getTime());
};

Extractions.prototype.initAppCheck = function() {
  /*
    TODO: Initialize and activate App Check
  */
};
