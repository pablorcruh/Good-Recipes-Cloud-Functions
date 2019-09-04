const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Firestore = require('@google-cloud/firestore');
const PROJECTID = 'good-recipes';
admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const firestore = new Firestore({
    projectId: PROJECTID
});

let recipeAuthor = "";
let recipeTitle = "";
let recipeDescription = "";
let registrationToken = [];
let payload;


exports.sendNotification = functions.firestore
    .document('recipe/{recipe}')
    .onCreate((docSnapshot,context) => {
        recipeAuthor = docSnapshot.data()['author'];
        recipeTitle = docSnapshot.data()['title'];
        recipeDescription = docSnapshot.data()['description'];
        payload = {
            notification: {
                title: `${recipeTitle}`,
                description: `${recipeDescription}`
            }
        };
        return db.collection('users/')
            .doc(recipeAuthor.toString())
            .get()
            .then((doc) => {
                let data = doc.data().followers.toString();
                let list = data.split(',');
                let followerList = list.filter((item)=>{
                    return item !=='start';
                });
                return followerList.forEach(function(follower) {
                    return db.collection('users/')
                        .doc(follower)
                        .get()
                        .then((userData) => {
                            console.log('>>>>>>>>>>>>>>>>>>>>', userData.data().token.toString());
                            registrationToken.push(userData.data().token.toString());
                            console.log('--------------------', registrationToken.length);
                            return admin.messaging().sendToDevice(registrationToken, payload)
                                .then(function(response) {
                                    console.log('###########'+response.results);
                                    const stillRegisteredTokens = registrationToken
                                    return response.results.forEach((result, index) => {
                                        console.log('==============' + result.messageId.toString());
                                        const error = result.error
                                        if (error) {
                                            const failedRegistrationToken = registrationToken[index];
                                            console.error('blah', failedRegistrationToken, error);
                                            if (error.code === 'messaging/invalid-registration-token'
                                                || error.code === 'messaging/registration-token-not-registered') {
                                                const failedIndex = stillRegisteredTokens.indexOf(failedRegistrationToken)
                                                if (failedIndex > -1) {
                                                    stillRegisteredTokens.splice(failedIndex, 1)
                                                }
                                            }
                                        }
                                    });
                                })
                                .catch((error) => {
                                    return error;
                                });
                        })
                        .catch((error) => {
                            return error;
                        });
                });
            })
            .catch((error) => {
                return error;
            });
    });