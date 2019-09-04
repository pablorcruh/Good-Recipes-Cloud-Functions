const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Firestore = require('@google-cloud/firestore');
const PROJECTID = 'good-recipes';
const firestore = new Firestore({
    projectId: PROJECTID
});

let recipeAuthor = "";
let recipeTitle = "";
let recipeDescription = "";
let registrationToken = [];
let payload;
admin.initializeApp(functions.config().firebase);

exports.sendNotification = functions.firestore
    .document('recipe/{recipe}')
    .onCreate((docSnapshot) => {
        recipeAuthor = docSnapshot.data()['author'];
        recipeTitle = docSnapshot.data()['title'];
        recipeDescription = docSnapshot.data()['description'];
        this.payload = {
            notification: {
                title: `${recipeTitle}`,
                description: `${recipeDescription}`
            }
        };
        return firestore.collection('users/')
            .doc(recipeAuthor.toString())
            .get()
            .then(doc => {
                let data = doc.data().followers;
                let followerList = data.split(',');
                return followerList.forEach((follower) => {
                    console.log("###########"+follower);
                    this.firestore.collection('users/')
                        .doc(follower.toString())
                        .get()
                        .then((userData) => {
                            registrationToken.push(userData.data().token.toString());
                            return admin.messaging().sendToDevice(registrationToken, this.payload)
                                .then((response) => {
                                    const stillRegisteredTokens = registrationToken
                                    return response.results.forEach((result, index) => {
                                        console.log('=============='+result);
                                        const error = result.error
                                        if (error) {
                                            const failedRegistrationToken = registrationToken[index]
                                            console.error('blah', failedRegistrationToken, error)
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