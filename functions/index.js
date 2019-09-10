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
                title: 'Good Recipe',
                body: "New Content added",
                sound: "default"
            },
            data: {
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
                registrationToken = [];
                return followerList.forEach(function(follower) {
                    return db.collection('users/')
                        .doc(follower)
                        .get()
                        .then((userData) => {
                            registrationToken.push(userData.data().token);
                            return admin.messaging().sendToDevice(registrationToken, payload)
                                .then((response) => {
                                    console.log(">>>>>>>>>>>> llega a la función", response)
                                    //console.log("#########"+response.results[0].error.toString());
                                    return true;
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