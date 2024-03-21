/* eslint-disable linebreak-style */
/* eslint-disable indent */
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
/**
 * Initializes the Extractions app.
 */
function Extractions() {
  const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);
  if(isLocalhost) {
    /*
      TODO: Set up local debug token
    */
  }

  this.filters = {
    // city: '',
    price: '',
    // category: '',
    sort: 'Rating',
    overall: 'Best',
    study: '',
    food: '',
    vibe: '',
    coffee: '',
  };

  this.dialogs = {};

  var that = this;
  that.initAppCheck();

  firebase.auth().signInAnonymously().then(function() {
    that.initTemplates();
    that.initFilterDialog();
    that.initRouter();
    that.initReviewDialog();
  }).catch(function(err) {
    console.log(err);
  });

  console.log("Extractions app initialized");
}

/**
 * Initializes the router for the Extractions app.
 */
Extractions.prototype.initRouter = function() {
  this.router = new Navigo();
  var that = this;
  this.router
    .on({
      '/': function() {
        that.updateQuery(that.filters);
      }
    })
    .on({
      '/setup': function() {
        that.viewSetup();
      }
    })
    .on({
      '/shops/*': function() {
        var path = that.getCleanPath(document.location.pathname);
        var id = path.split('/')[2];
        that.viewShop(id);
      }
    })
    .resolve();
  firebase
    .firestore()
    .collection('shops')
    .limit(1)
    .onSnapshot(function(snapshot) {
      if (snapshot.empty) {
        that.router.navigate('/setup');
      }
    });
};

Extractions.prototype.getCleanPath = function(dirtyPath) {
  if (dirtyPath.startsWith('/index.html')) {
    return dirtyPath.split('/').slice(1).join('/');
  } else {
    return dirtyPath;
  }
};

Extractions.prototype.getFirebaseConfig = function() {
  return firebase.app().options;
};

Extractions.prototype.getRandomItem = function(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
};

Extractions.prototype.data = {
  words: [
    'Bar',
    'Fire',
    'Grill',
    'Drive Thru',
    'Place',
    'Best',
    'Spot',
    'Prime',
    'Eatin\''
  ],
  cities: [
    'Albuquerque',
    'Arlington',
    'Atlanta',
    'Austin',
    'Baltimore',
    'Boston',
    'Charlotte',
    'Chicago',
    'Cleveland',
    'Colorado Springs',
    'Columbus',
    'Dallas',
    'Denver',
    'Detroit',
    'El Paso',
    'Fort Worth',
    'Fresno',
    'Houston',
    'Indianapolis',
    'Jacksonville',
    'Kansas City',
    'Las Vegas',
    'Long Island',
    'Los Angeles',
    'Louisville',
    'Memphis',
    'Mesa',
    'Miami',
    'Milwaukee',
    'Nashville',
    'New York',
    'Oakland',
    'Oklahoma',
    'Omaha',
    'Philadelphia',
    'Phoenix',
    'Portland',
    'Raleigh',
    'Sacramento',
    'San Antonio',
    'San Diego',
    'San Francisco',
    'San Jose',
    'Tucson',
    'Tulsa',
    'Virginia Beach',
    'Washington'
  ],
  categories: [
    'Brunch',
    'Burgers',
    'Coffee',
    'Deli',
    'Dim Sum',
    'Indian',
    'Italian',
    'Mediterranean',
    'Mexican',
    'Pizza',
    'Ramen',
    'Sushi'
  ],
  ratings: [
    {
      rating: 1,
      text: 'Would never eat here again!'
    },
    {
      rating: 2,
      text: 'Not my cup of tea.'
    },
    {
      rating: 3,
      text: 'Exactly okay :/'
    },
    {
      rating: 4,
      text: 'Actually pretty good, would recommend!'
    },
    {
      rating: 5,
      text: 'This is my favorite place. Literally.'
    }
  ]
};

window.onload = function() {
  window.app = new Extractions();
  var minWidth = 600; // Minimum width in pixels
  if (window.innerWidth < minWidth) {
      // If the screen width is less than 600px
      document.getElementById('mainContent').style.display = 'none'; // Hide the main content
      document.getElementById('mobileMessage').style.display = 'flex'; // Show the mobile message
      console.log("Mobile");
  } else {
      // If the screen width is 600px or more
      document.getElementById('mainContent').style.display = 'block'; // Show the main content
      document.getElementById('mobileMessage').style.display = 'none'; // Hide the mobile 
      console.log("Desktop");
  }
};
