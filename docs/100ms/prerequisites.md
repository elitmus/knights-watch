## Prerequisites

It's assumed that you know how to use a terminal, install things and have a git.

### 1. Software Dependency - RubyOnRails

- [RubyOnRails](https://guides.rubyonrails.org/)

This will be the main application, with which we will use `knights-watch` as a dependency.

We have tested and developed against the following version:

```bash
    - rubyonrails: v6.x
```

### 2. Software Dependency - Redis

- [Redis](https://redis.io/)

Redis will be used, for storing the room state of every candidate and proctor. Rooms will be created for max `N` candidate and `M` proctor. `N` and `M` and configurable number given from the main application.

We have tested and developed against the following version:

```bash
    - redis: v7.x
```

### 3. Gem Dependency - Redis Gem

- [Redis-rb](https://github.com/redis/redis-rb)

A ruby client library for redis.

We have tested and developed against the following version:

```bash
   - redis-rb: v4.x
```

### 4. Gem Dependency - JWT

- [ruby-jwt](https://github.com/jwt/ruby-jwt)

Jwt is used for authentication of the API's request to the application.

We have tested and developed against the following version:

```bash
    - jwt: v2.x
```

### 5. Gem Dependecy - Sqlite

- [Sqlite](https://github.com/sparklemotion/sqlite3-ruby)

Sqlite is a development dependency used for running the test.

We have tested and developed against the following version:

```bash
   - sqlite: v1.x
```

### 6. Libarary Dependency - HMS Video Store

- [hms-video-store](https://cdn.skypack.dev/@100mslive/hms-video-store)

Hms video store is a CDN library from 100ms, used to join the webrtc peer to peer connection, send notifications and initiate the video proctoring in both the candidate and proctor end.

We have tested and developed against the following version:

```bash
    - hms-video-store: v0.8.x
```





