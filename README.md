[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

## Linklet

Linklet as of now contains the links which are shared in whatsapp freeCodeCamp Hyderabad group. Since many useful links were shared in the group so I thought to create an app where we can find all links easily based on particular date.

## Linklet API

### Base Url
```
https://api.linklet.ml
```

### Endpoints
#### Links
##### #1
```
GET /api/links/all/
``` 
- It fetches all the links without any filters
- It takes following query parameters
  - page: Number greater than 0 (defaults to 1)
  - sort: 1 or -1
  - search: keyword to be searched
- Example
```
https://api.linklet.ml/api/links/all?page=2&sort=-1&search=freecodecamp
``` 

##### #2
```
GET /api/links/filter/
``` 
- It fetches all the links with date range filters
- It takes following query parameters
  - page: Number greater than 0 (defaults to 1)
  - start: unix timestamp(in milliseconds) of starting date range
  - end: unix timestamp(in milliseconds) of ending date range
  - sort: 1 or -1
  - search: keyword to be searched
- Example
```
https://api.linklet.ml/api/links/filter?start=1490342174681&end=1490428574681&search=javascript
``` 

##### #3
```
GET /api/links/me/all
```
- It's same as `GET /api/links/all` but it gets all links posted by loggedIn user. **You need to send `X-AUTH` header with JWT token**.

##### #4
```
GET /api/links/me/filter
```
- It's takes same query params as `GET /api/links/filter` but it gets filtered links posted by loggedIn user. **You need to send `X-AUTH` header with JWT token**.

##### #5
```
GET /api/bookmarks/me/all
```
- It's same as `GET /api/links/all` but it gets all bookmarks bookmarked by loggedIn user. **You need to send `X-AUTH` header with JWT token**.

##### #6
```
GET /api/bookmarks/me/filter
```
- It's takes same query params as `GET /api/links/filter` but it gets filtered bookmarks bookmarked by loggedIn user. **You need to send `X-AUTH` header with JWT token**.

##### All the above endpoints returns response in following form
- PerPage only top `12` results are returned

```js
{
  "page": 1,
  "perPage": 12,
  "totalLinks": 1123,
  "isLastPage": false,
  "links": [
    {
      "_id": "58d55ccf05247cca9c2f9f4b",
      "__v": 0,
      "author": null,
      "date": "2017-03-24T00:00:00.000Z",
      "description": "Sessions are recommended over cookies in most situations but it is good to understand how cookies work as well. In this video we will be using the setcookie(...",
      "image": "https://i.ytimg.com/vi/RzMjwICWKr4/maxresdefault.jpg",
      "publisher": "YouTube",
      "title": "PHP Front To Back [Part 17] - Cookies Tutorial",
      "url": "https://youtu.be/RzMjwICWKr4",
      "timestamp": 1490366640000
    },
    ...
  ]
}
``` 

##### #7
```
GET /api/metadata
```
- It is used to fetch link metadata
- It takes only one query param i.e `url`
- Example
```
https://api.linklet.ml/api/metadata?url=https://freecodecamo.com
```
- Response
```
{
  "author": null,
  "date": null,
  "description": "Learn to code and build projects for nonprofits. Build your full stack web development portfolio today.",
  "image": "https://s3.amazonaws.com/freecodecamp/curriculum-diagram-full.jpg",
  "publisher": "Free Code Camp",
  "title": "Learn to code and help nonprofits",
  "url": "https://www.freecodecamp.com"
}
```

##### #8
```
POST /api/links
```
- It is used to save link submitted by user
- You need to send metadata which you got from `/api/metadata` endpoint.
- Since submitting links only works when user is authenticated so **You need to send `X-AUTH` header with JWT token**.

##### #9
```
PATCH /api/links/<linkId>/views
```
- It is used to increment the view count of link.
- When you fetch links using above `#1`, `#2` etc... endpoints you will receive a array of links with each link having following structure where `_id` is unique id of link.
```
{
    "_id": "58d55ccf05247cca9c2f9f4b",
    ...
  }
```
- In this endpoint you need to replace `<linkId>` with `_id` of that link.

##### #10
```
PATCH /api/links/<linkId>/bookmark
```
- It is used to increment the view count of link.
- When you fetch links using above `#1`, `#2` etc... endpoints you will receive a array of links with each link having following structure where `_id` is unique id of link.
```
{
    "_id": "58d55ccf05247cca9c2f9f4b",
    ...
  }
```
- In this endpoint you need to replace `<linkId>` with `_id` of that link.
- And **You need to send `X-AUTH` header with JWT token**.

#### Authentication
##### #1
```
 GET /api/login
```
- It needs github `access_token` to create new user or login existing user
- You need to send that `access_token` as query param
- On success you will receive `loginToken` i.e the JWT token and `user` in response

##### #2
```
  GET /api/logout
```
- It will logout the user
- And **You need to send `X-AUTH` header with JWT token**.


##### #3
```
  GET /api/users/me
```
- It will fetch the user details of provided `X_AUTH` token user
- And **You need to send `X-AUTH` header with JWT token**.

## Authors
- VinayPuppal ([@vinaypuppal](https://vinaypuppal.com))