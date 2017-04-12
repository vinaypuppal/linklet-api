[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

## Linklet

Linklet as of now contains the links which are shared in whatsapp freeCodeCamp Hyderabad group. Since many useful links were shared in the group so I thought to create an app where we can find all links easily based on particular date.

## Linklet API

### Base Url
```
https://api.links.linklet.ml
```

### Endpoints
#### #1
```
/api/links/all/
``` 
- It fetches all the links without any filters
- It takes following query parameters
  - page: Number greater than 0 (defaults to 1)
  - sort: 1 or -1
  - search: keyword to be searched
- Example
```
https://api.links.linklet.ml/api/links/all?page=2&sort=-1&search=freecodecamp
``` 

#### #2
```
/api/links/filter/
``` 
- It fetches all the links with date range filters
- It takes following query parameters
  - page: Number greater than 0 (defaults to 1)
  - start: timestamp of starting date range
  - end: timestamp of ending date range
  - sort: 1 or -1
  - search: keyword to be searched
- Example
```
https://api.links.linklet.ml/api/links/filter?start=1490342174681&end=1490428574681&search=javascript
``` 

#### All the above endpoints returns response in following form
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

## Authors
- VinayPuppal ([@vinaypuppal](https://vinaypuppal.com))