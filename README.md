# Northcoders News API

Link to the hosted project: https://nc-news-p6kr.onrender.com/api

The link currently leads to the endpoints json object, displaying all the endpoints and what they do\
Right now the project is the back end of a news article website with databases for users, topics, articles and comments

To clone: you will need git installed, run 'git clone https://github.com/jack-204/nc-news.git'\
run 'npm install' to install the npm packages needed\
to seed the local database: 'npm run seed'\
to run tests: 'npm run test'\
the tests run off their own smaller database that is easier to manage\
two .env. files will be needed to access the databases locally, .env.test and .env.development\
the files will need a single line with PGDATABASE=nc_news for the development file and PGDATABASE=nc_news_test for the test file\
using node version 20.7.0\
using PostgreSQL version 15.5