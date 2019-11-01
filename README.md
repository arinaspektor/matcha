#  matcha
----
The second web project of 42 school is a tinder-like dating site. Interaction between users is the heart of the project.

## main stack
* Node.js, Express
* MongoDB with mongoose
* Socket.io
* EJS, Bootstrap
---
## general features
1. Passport authentication: local and  [42](https://api.intra.42.fr/apidoc) using the OAuth 2.0 API.
2. User positioning using Geolocation API and 
node-geocoder. If user doesn't provide permissions I use their IP-address to find location.
3. Real-time interactions: notification system, user status and chat.
4. List of suggestions that match their profile by multiple criteria: sex preferences, same geographical area, with a maximum of common interests and the highest "fame rating".
5. Research available by an age gap, distance, "fame rating" and interest (tag).
6. Suggestions and research results are sortable and filterable by age, distance, fame rating and quantity of common interests.

----
## usage

Project requires npm, MongoDB and Redis to be installed.
Also you need to get [Geocoder](https://npmjs.com/package/node-geocoder) API key as well as [42 API](https://api.intra.42.fr/apidoc) client id and secret.

Clone the repo and create an .env file in the root directory of the project with the following information in the form of NAME=VALUE:
    
    PORT=3000
    HOST=localhost:3000
    REDIS_PORT=6379
    REDIS_TTL=86400
    SESSION_SECRET=<yoursecretstring>
    GEOCODER_API_KEY=<yourkey> 
    FT_CLIENT_ID=<your42id>
    FT_CLIENT_SECRET=<your42secret>

Then start Redis and Mongo.

Install all dependencies

    npm i

And start an app

    npm start
    
You can use seed.js file to create a list of fake users.
