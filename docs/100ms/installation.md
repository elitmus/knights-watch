## Installation Guidelines :rocket:

Before you start following the guidelines, make sure to go through the [prerequisites guide](./prerequisites.md) to install the required tools and packages on your machine.

### Setting Up the 100ms Credentails

1. Visit [100ms](https://www.100ms.live/)

2. Create App from the dashboard.

- Fill the mandatory details.
- Create Roles
  - Candidates:

    Properties:

    ```text
    1. Can share audio: true
    2. Can share video: true
    3. Can share screen: false
    4. Video Quality: `360p`
    5. Video Aspect Ratio: '16:9'
    6. Rest all the permission will be: false
    ```
  
  - Proctors:

    Properties:

    ```text
    1. Can share audio: false
    2. Can share video: false
    3. Can share screen: false
    4. Video Quality: `360p`
    5. Video Aspect Ratio: '16:9'
    6. Subscribe to: 'Candidates'
    7. Can change any participant's role: false
    8. Can mute any participant: true
    9. Can ask participant to unmute: true
    10. Can remove participant from the room: false
    11. Rest all the permission will be: false
    ```
- Create a subdomain
- And save your app
- You will get a `template_id`, which will be used for configuration.
- Copy the Secret key and secret base which will be used for configuration.

### Installing project

1. Clone this repository and move to `knights-watch` directory
   ```sh
   git clone https://github.com/elitmus/knights-watch
   cd knights-watch
   ```

2. Install dependencies
   ```sh
   bundle install
   yarn install
   ```

3. Create a new Rails app
   ```sh
   rails new demo-proctoring-app
   ```

4. Install main app dependencies
   ```sh
   bundle install
   yarn install
   ```

5. Follow the usage section as mentioned in [Readme.md](../../README.md)