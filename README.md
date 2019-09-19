# Good Recipes - Cloud Functions
El siguiente proyecto contiene las cloud functions que se utilizan
para poder enviar notificaciones dentro del proyecto [Good recipes](https://github.com/pablorcruh/Good-Recipes)

Esta función reacciona al evento de inserción de información dentro de 
Firestore en la colección de recetas.

Encuentra el autor de la publicación y procede a obtener la lista de 
seguidores dentro de la coleccion de usuarios.

Una vez que se obtiene los seguidores procedemos a extraer los tokens
de cada usuario para proceder a llenar una lista a la que se hará llegar
nuestras notificaciones.

El proyecto necesita del archivo **functions/good-recipes-functions-account.json**
para ello es necesario la creación de un proyecto dentro de la consola de firebase

Se hace uso de dos colecciones: usuarios y recetas. A continuación 
describimos la estructura de cada colección.

#### Colección usuarios
```
{ 
   "author":"string",
   "creationDate":"timestamp",
   "description":"string",
   "ingredients":[],
   "name":"string",
   "recipeImageUrl":"string",
   "steps":[]
}

```
#### Colección Recetas

```
{ 
   "email":"string",
   "followers":[],
   "token":"string",
   "username":"string"
}

```
Descargar el proyecto y ejecutar los siguiente.

```
    npm install
```
Para desplegar la función dentro de la nube de Google 

```
    firebase deploy --only functions
```
