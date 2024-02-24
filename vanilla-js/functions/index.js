/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

require("dotenv").config();
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
exports.helloWorld = onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

// RUN TESTS AND BUILD THIS FUNCTION
exports.placeDetails = onRequest(request, response) => {
    var placeId = request.query.placeId;
    // Might need to use cors-anywhere to get around CORS issues with alternative fetch method
    var ans = fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&&key=${process.env.GOOGLE_API_KEY}`,{
      mode : 'no-cors',
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.log(error));
    console.log("this is ans", ans);
}
logger.info("Hello logs!", {structuredData: true});
