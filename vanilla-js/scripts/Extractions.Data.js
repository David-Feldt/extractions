/* eslint-disable linebreak-style */
// eslint-disable-next-line linebreak-style
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

Extractions.prototype.addShop = function(data) {
    var collection = firebase.firestore().collection('shops');
    return collection.add(data);
};

Extractions.prototype.getAllShops = function(renderer) {
    var query = firebase.firestore()
        .collection('shops')
        // .orderBy('avgRating', 'desc')
        .limit(50);
    this.getDocumentsInQuery(query, renderer);
};

Extractions.prototype.getDocumentsInQuery = function(query, renderer) {
    query.onSnapshot(function(snapshot) {
        if (!snapshot.size) {return renderer.empty();} // Display "There are no shops".

        snapshot.docChanges().forEach(function(change) {
            if (change.type === 'removed') {
                renderer.remove(change.doc);
            } else {
                renderer.display(change.doc);
            }
        });
    });
};

Extractions.prototype.getShop = function(id) {
    return firebase.firestore().collection('shops').doc(id).get();
};

Extractions.prototype.getFilteredShops = function(filters, renderer) {
    var query = firebase.firestore().collection('shops');

    if (filters.category !== 'Any') {
        query = query.where('category', '==', filters.category);
    }

    if (filters.city !== 'Any') {
        query = query.where('city', '==', filters.city);
    }

    if (filters.price !== 'Any') {
        query = query.where('price', '==', filters.price.length);
    }

    console.log('GET FILTERED SHOPS');
    if (filters.sort === 'Rating') {
        // query = query.orderBy('avgRating', 'desc');
    } else if (filters.sort === 'Reviews') {
        // query = query.orderBy('numRatings', 'desc');
    }

    this.getDocumentsInQuery(query, renderer);
};

Extractions.prototype.addRating = function(shopID, rating) {
    Extractions.prototype.addRating = function(shopID, rating) {
        var collection = firebase.firestore().collection('shops');
        var document = collection.doc(shopID);
        var newRatingDocument = document.collection('ratings').doc();
    
        return firebase.firestore().runTransaction(function(transaction) {
            return transaction.get(document).then(function(doc) {
                var data = doc.data();
          
                var newAverage =
                (data.numRatings * data.avgRating + rating.rating) /
                (data.numRatings + 1);
          
                transaction.update(document, {
                    numRatings: data.numRatings + 1,
                    avgRating: newAverage
                });
                return transaction.set(newRatingDocument, rating);
            });
        });
    };  
};  
