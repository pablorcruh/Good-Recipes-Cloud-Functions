const functions = require('firebase-functions');
const admin =  require ('firebase-admin');
admin.initializeApp(functions.config().firebase);
exports.notifyNewRecipe =functions.firestore
    .document('recipe/{recipe}')
    .onCreate((docSnapshot) =>{
        recipeAuthor = docSnapshot.data()['author'];
        recipeTitle = docSnapshot.data()['title'];
        recipeDescription = docSnapshot.data()['description'];
        //console.log('se ha creado una recete>>>>>>>>>'+recipe);
        const payload = {notification:{
                title: `${recipeTitle}`,
                description: `${recipeDescription}`
            }
        };
        return admin.messaging().sendToTopic("Recipe", payload)
            .then((response)=>{
                console.log('Notification sent successfull', response);
                return true;
            })
            .catch((error)=>{
                console.log('Notification send failed:', error);
            });
    });
