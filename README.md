# [GameTradeMarket PROD](https://api.gametrade.market/api/graphql) / [GameTradeMarket QA](https://api.qa.gametrade.market/api/graphql)

Backend is implemented using the [NestJS](https://nestjs.com/) framework
For database communication, [TypeORM](https://typeorm.io/) is used

## Environment Settings

Environment settings are stored in the .env file in the project root
You can copy .env.example and rename it to .env

Environment settings can be taken from either the variable itself or from AWS Secret Manager.
To get a value from Secret Manager, you need to specify the record key (example: qa/jwt/public-9j1x9y)

To set environment settings on servers, you need to go to
[ElasticBeanstalk PROD](https://us-east-1.console.aws.amazon.com/elasticbeanstalk/home?region=us-east-1#/environment/dashboard?environmentId=e-nnjwcpmaic)
[ElasticBeanstalk QA](https://us-east-1.console.aws.amazon.com/elasticbeanstalk/home?region=us-east-1#/environment/dashboard?environmentId=e-73hnpppmcz)
and select the Configuration section and find the Updates, monitoring, and logging block

## Installation

```bash
$ yarn install
```

## Running the Application

```bash
# in development mode
$ yarn run start

# in debug mode
$ yarn run start:debug

# in production mode
$ yarn run start:prod
```

# Database Migrations

Database migrations can be performed in automatic or manual mode

For manual mode, the following commands should be used:
`yarn run typeorm:run` - run migrations
`yarn run typeorm:revert` - rollback the last successful migration

For automatic mode, you need to set TYPEORM_MIGRATIONS_RUN=true. Then migrations will run automatically when the application starts.

To create a migration, you need to create a migration file in the src/migrations directory. For information on how to create migrations, see the [TypeORM](https://typeorm.io/migrations) documentation

# CI/CD

Project deployment is done in AWS using CodePipeline
[CodePipeline PROD](https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/prod-marketplace-backend/view?region=us-east-1)
[CodePipeline QA](https://us-east-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/marketplace-backend-qa/view?region=us-east-1)

To deploy to QA, you need to merge changes with the develop branch
To deploy to PROD, you need to merge changes with the master branch

It's preferable to do this through a Merge Request!

# Logging

To access logs, you need to go to AWS ElasticBeanstalk and select the Logs section

[ElasticBeanstalk PROD](https://us-east-1.console.aws.amazon.com/elasticbeanstalk/home?region=us-east-1#/environment/dashboard?environmentId=e-nnjwcpmaic)
[ElasticBeanstalk QA](https://us-east-1.console.aws.amazon.com/elasticbeanstalk/home?region=us-east-1#/environment/dashboard?environmentId=e-73hnpppmcz)

# License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/).

This means you are free to:
- Share — copy and redistribute the material in any medium or format
- Adapt — remix, transform, and build upon the material

Under the following terms:
- Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made.
- NonCommercial — You may not use the material for commercial purposes.