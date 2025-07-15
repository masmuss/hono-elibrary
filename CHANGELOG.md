# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [1.6.0](https://github.com/masmuss/hono-elibrary/compare/v1.5.0...v1.6.0) (2025-07-15)


### Features

* **seeder:** add database seeder for generating main user with admin, librarian and member role ([1eeab90](https://github.com/masmuss/hono-elibrary/commit/1eeab907076a76ff766938b71be1877a4ae77da2))

## [1.5.0](https://github.com/masmuss/hono-elibrary/compare/v1.4.0...v1.5.0) (2025-07-14)


### Features

* add log viewer for log ([f632250](https://github.com/masmuss/hono-elibrary/commit/f6322503c197a6a028d292f0f80188f8811281a8))
* **log:** add audit log for category module ([9bd8d7e](https://github.com/masmuss/hono-elibrary/commit/9bd8d7ee02799597903daade6dd4934d7f2fe0bc))
* **log:** add audit log for loan module ([4423967](https://github.com/masmuss/hono-elibrary/commit/4423967f6b4ac3c04ac4073d5f8c983326cb2d08))
* **log:** add audit log for user management module ([323b860](https://github.com/masmuss/hono-elibrary/commit/323b860475e8fc11b8f1188daa9d6a8de31459c4))
* **log:** add audit-logs table and init log function ([c6ebd27](https://github.com/masmuss/hono-elibrary/commit/c6ebd277651e75121215aedac96d80b08d9af8e5))
* **log:** implement audit log in auth module ([07b683e](https://github.com/masmuss/hono-elibrary/commit/07b683e72b39db6c811db3a5e2817a75a1e054f9))
* **log:** implement audit log in book resource ([0afe6c2](https://github.com/masmuss/hono-elibrary/commit/0afe6c2960c32763f461869cfc96a44c11b7b0d2))
* **log:** implement audit log in member module ([adeccc3](https://github.com/masmuss/hono-elibrary/commit/adeccc39ec96b03006d907972c0b6df5dc47411e))


### Bug Fixes

* **log:** add correlation id column for trace many activities with single request ([895e0d0](https://github.com/masmuss/hono-elibrary/commit/895e0d0c0e4f0d7a92d7caddb0e059fb40eab3d8))
* **log:** fix status classification from api response ([6bd0fd2](https://github.com/masmuss/hono-elibrary/commit/6bd0fd2da3fbda4557ef9a6bd5172a161178677c))

## [1.4.0](https://github.com/masmuss/hono-elibrary/compare/v1.3.0...v1.4.0) (2025-06-24)


### Features

* add forgot and reset password feature ([8ae7b6f](https://github.com/masmuss/hono-elibrary/commit/8ae7b6f4d9b2c58bef5310de7092b8076f342ef2))

## [1.3.0](https://github.com/masmuss/hono-elibrary/compare/v1.2.0...v1.3.0) (2025-06-24)


### Features

* implement refresh token for auth ([7d93613](https://github.com/masmuss/hono-elibrary/commit/7d93613bc7ecf8dfacb9a4bf946837785a2791b7))

## [1.2.0](https://github.com/masmuss/hono-elibrary/compare/v1.1.1...v1.2.0) (2025-06-24)


### Features

* add change password feature ([497cf66](https://github.com/masmuss/hono-elibrary/commit/497cf66b0a91a6ceed564938a42415eccc3dfe4a))

## [1.1.1](https://github.com/masmuss/hono-elibrary/compare/v1.1.0...v1.1.1) (2025-06-24)

## 1.1.0 (2025-06-24)


### Features

* add auth feature with jwt ([0d4c603](https://github.com/masmuss/hono-elibrary/commit/0d4c603c688465fa40c2eb756546db1bc0bc43de))
* add authorization middleware ([f183cbb](https://github.com/masmuss/hono-elibrary/commit/f183cbb1ab75ac4823e1e01fc5c10807a9776e85))
* add caching using redis on categories and books ([663ab0a](https://github.com/masmuss/hono-elibrary/commit/663ab0a4b87849ece432fbec84bc068639079f2e))
* add caching using redis on categories and books ([c692a5e](https://github.com/masmuss/hono-elibrary/commit/c692a5e14b4ad0967a42582d54f60ac9a99db99b))
* add category management ([f912650](https://github.com/masmuss/hono-elibrary/commit/f91265097ff48e799b5d7dcc25517cee478ccb5f))
* add create book endpoint ([c13b8e2](https://github.com/masmuss/hono-elibrary/commit/c13b8e2e39a16fd79e5cb97e334388e6c95f4bba))
* add endpoint for getting member loan ([dcbb580](https://github.com/masmuss/hono-elibrary/commit/dcbb58044e4accacca5c4900b7c1d3b7a32f5d52))
* add file structure ([09cd035](https://github.com/masmuss/hono-elibrary/commit/09cd0355e02a33e3ca79a8fc02c41342fd0af75f))
* add get all books and get book by id endpoint ([504012e](https://github.com/masmuss/hono-elibrary/commit/504012e421c1de01a933db4fdbe2971bcc956e7d))
* add integration test for auth ([8c6a03f](https://github.com/masmuss/hono-elibrary/commit/8c6a03f59bb525cc963a13a46d375ef10e00b30d))
* add loan feature ([b1fb652](https://github.com/masmuss/hono-elibrary/commit/b1fb65262a788164eb3f1246e7933c6a9155194a))
* add loan max limit for member ([577f760](https://github.com/masmuss/hono-elibrary/commit/577f760faabcbf9acec4bfcf63447bf9a0fe8c73))
* add member profile management ([d6586c2](https://github.com/masmuss/hono-elibrary/commit/d6586c25cb23f398d9d253973314331aaeaede87))
* add openapi documentation for request and response resource ([0b3edd5](https://github.com/masmuss/hono-elibrary/commit/0b3edd5eefd4c4215099dafbff71ef5d97891883))
* add pages column inside books table ([242cb8e](https://github.com/masmuss/hono-elibrary/commit/242cb8eea6380adfe03990cea3e4c38c2f70ffe9))
* add rate limiter using redis ([3309811](https://github.com/masmuss/hono-elibrary/commit/33098112ce2aad547fb085a7840c6c5f749e8f15))
* add soft delete mixin to handle collection that has soft delete feature ([ea524e4](https://github.com/masmuss/hono-elibrary/commit/ea524e48091fc2d71a3aa3d26c0ca35cd4517dd2))
* add timestamp helper and implement into categories and book table ([890b8f6](https://github.com/masmuss/hono-elibrary/commit/890b8f6dfc1e572949f4197d094e7e77e8fc665e))
* add unique flag in isbn books table field ([899297b](https://github.com/masmuss/hono-elibrary/commit/899297b265e21602a0d95f17c13fd662e8676d1e))
* add update and delete book endpoint ([f43bab9](https://github.com/masmuss/hono-elibrary/commit/f43bab9c439fa907bb6666172416001c99ed4193))


### Bug Fixes

* fix get all books response ([b2bcea9](https://github.com/masmuss/hono-elibrary/commit/b2bcea9e027cb45086112f5ac439412c5de00be3))
