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
    this.getDocumentsInQuery(query, renderer,{overall: "Best"});
};

Extractions.prototype.getDocumentsInQuery = function(query, renderer,filters) {
    query.onSnapshot(function(snapshot) {
        if (!snapshot.size) {return renderer.empty();} // Display "There are no shops".
        let newSnapshot = snapshot.docs.map(function(doc) {
            const data = doc.data();
            let score = 0;
            if(filters.study == "Best"){
                score += data.study;
            }
            if(filters.study == "Worst"){
                score -= data.study;
            }
            if(filters.vibe == "Best"){
                score += data['vibe rating'];
            }
            if(filters.vibe == "Worst"){
                score -= data['vibe rating'];
            }
            if(filters.food == "Best"){
                score += data['food rating'];
            }
            if(filters.food == "Worst"){
                score -= data['food rating'];
            }
            if(filters.overall == "Best"){
                score += data['overall rating'];
            }
            if(filters.overall == "Worst"){
                score -= data['overall rating'];
            }
            if (filters.coffee === 'Best') {
                score += data['coffee rating'];
            }
            if(filters.coffee == "Worst"){
                score -= 'coffee rating';
            }
            data.score = score;
            return {
                id: doc.id,
                data: data
            };
        
        });

        const sortedSnapshot = newSnapshot.sort((a, b) => b.score - a.score);

        sortedSnapshot.forEach(function(doc) {
            renderer.display(doc);
        });
        // snapshot.docChanges().forEach(function(change) {
        //     if (change.type === 'removed') {
        //         renderer.remove(change.doc);
        //     } else {
        //         renderer.display(change.doc);
        //     }
        // });
    });
};

Extractions.prototype.getShop = function(id) {
    return firebase.firestore().collection('shops').doc(id).get();
};

Extractions.prototype.getFilteredShops = function(filters, renderer) {
    var query = firebase.firestore().collection('shops');

    // COMBINE ALL FILTERS INTO A SCORE CATEGORY AND SORT BY THAT

    // if (filters.category !== 'Any') {
    //     query = query.where('category', '==', filters.category);
    // }

    // if (filters.city !== 'Any') {
    //     query = query.where('city', '==', filters.city);
    // }

    // if (filters.price !== 'Any') {
    //     query = query.where('price', '==', filters.price.length);
    // }
    if(filters.study == "Best"){
        query = query.orderBy('study', 'desc');
    }
    if(filters.study == "Worst"){
        query = query.orderBy('study', 'asc');
    }
    if(filters.vibe == "Best"){
        query = query.orderBy('vibe rating', 'desc');
    }
    if(filters.vibe == "Worst"){
        query = query.orderBy('vibe rating', 'asc');
    }
    if(filters.food == "Best"){
        query = query.orderBy('food rating', 'desc');
    }
    if(filters.food == "Worst"){
        query = query.orderBy('food rating', 'asc');
    }
    if(filters.overall == "Best"){
        query = query.orderBy('overall rating', 'desc');
    }
    if(filters.overall == "Worst"){
        query = query.orderBy('overall rating', 'asc');
    }
    if (filters.coffee === 'Best') {
        query = query.orderBy('coffee rating', 'desc');
    }
    if(filters.coffee == "Worst"){
        query = query.orderBy('coffee rating', 'asc');
    }
    
    // if (filters.sort === 'Aidan') {
    //     query = query.orderBy('overall rating', 'desc');
    //     console.log("SORTING BY RATING");
    // }

    this.getDocumentsInQuery(query, renderer,filters);
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
