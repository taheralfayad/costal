# COSTAL

## Local Development

1. First, make sure you have ngrok installed (instructions can be found [here](https://ngrok.com/download)). Run the following command to start ngrok and expose port 8000.
```
$ ngrok http 8000
``` 

2. Create a new .env file by copying the env template with the following command. Follow the information on [Canvas API Key Setup](#canvas-api-key-setup) to fill out the values in your .env
```
$ cp .env.template .env
```

3. Build the project with `make build`
```
$ make build
Building Costal images
```

4. Run COSTAL and it's services with `make start-attached`.
```
$ make start-attached
Starting Costal in attached mode
docker compose -f docker-compose.yml up
```

5. Run database migrations with `make migrate`.
```
$ make migrate
docker compose -f docker-compose.yml run --rm web python manage.py migrate
```

6. To install the tool into your local canvas instance, follow the steps in [Generating LTI Keys](#generating-lti-keys). After finishing the [course deployment](#deploy-to-an-account-or-course), COSTAL should be availible in the course navigation section on the left side of the course it was installed in.

### Canvas API Key Setup

By creating an API key for the application, the tool can access and make changes to any courses it is deployed in. The API key should only have to be set once.

Instructure provides a detailed explanation of the API key creation process [here](https://community.canvaslms.com/t5/Admin-Guide/How-do-I-add-a-developer-API-key-for-an-account/ta-p/259), however simple instructions will be included below.

1. Start your local canvas instance and login. Navigate to **Admin > Site Admin > Developer Keys**. On the Developer Keys page, click **+ Developer Key** to add a new API key.
2. Set the Redirect URIs and Redirect URI (Legacy) to the following URI format (with your ngrok link).
```
https://<use-your-unique-number-here>.ngrok-free.app/oauth/oauth_complete/
```
3. Save the key, and enable it by changing the state to "On".
4. Copy the `API_CLIENT_ID` (# under the details column) and `API_CLIENT_ID_SECRET` (visible after clicking "Show Key") and paste them into your .env file

### Generating LTI Keys

As part of the LTI 1.3 process, COSTAL uses a public and private keypair in order to authenticate into the canvas LMS. To generate a new keypair, use the command below to start the key generation CLI. The first time you generate keys, choose the option to create a new key set. Later, this key set will be associated with a registration of COSTAL into a platform.

```sh
make generate-keys 
```

Take note of the ID of the key set that was created or used. You will need this value later.

If you create additional keys in the future, you may create new key sets or add the key to an existing key set. Note that currently COSTAL only uses the first key in a given keyset.

#### Tool Registration

To register COSTAL as an LTI 1.3 tool into a platform, run the following command:

```sh
make register
```

If you're using a local canvas instance, choose the first platform option. If you have a seperate hosted canvas service you're deploying, choose the second option and pass in the server url. 

You will be prompted to enter a Client ID. The next section will explain how to get the Client ID from Canvas.

#### Create Developer LTI Key / Get Client ID

1. On your local canvas instance, navigate to **Admin > Site Admin > Developer Keys**. On the Developer Keys page, click **+ Developer Key** and add a new LTI key
2. Ensure the application and ngrok is running and go to the following url (in a new tab) to get the tool's LTI config JSON. Copy the contents of the page.
```
https://<use-your-unique-number-here>.ngrok-free.app/lti/config
```
3. Back on your local canvas instance, choose the **Paste JSON** method, and paste the applications config JSON. 
4. Save the developer key and enable it by changing the state to "On".
5. Copy the number formatted as "1000000000XXXX" in the details column for the new key you created. This is the tool's Client ID.

#### Finish Registration

Paste the Client ID into the registration script.

Note that Client IDs must be unique for a given issuer and cannot be used multiple times. If you have already registered a Client ID, you do not need to make an additional registration and can make multiple deployments with the existing registration.

Select which key set you would like to use. Typically, this will be the one you created earlier in the process.

#### Deploy to an Account or Course

1. First, head into the course you wish to install the LTI in on your local canvas instance. Navigate to **Settings > Apps** and click the blue "+ App" button.
2. Set the configuration type to "By Client ID" and paste in the client ID from your LTI key before.
3. On the new app, click the gear icon and then click "Deployment ID". Copy this value as it will be used in the deploy step.
4. Run the following command to start the deployment process:
```sh
make deploy
```
5. Select which registration you'd like to use for this deployment. Typically, it will be the one you created in the previous section. When prompted, paste the deployment ID you copied earlier.
