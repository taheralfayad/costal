# COSTAL

## Local Development

1. Setup a self-signed cert with the following commands to run COSTAL over HTTPS on localhost.
```
$ openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes
``` 

2. Move key and cert to the correct location.
```
$ sudo mkdir -p /etc/nginx/ssl
$ sudo mv key.pem /etc/nginx/ssl/
$ sudo mv cert.pem /etc/nginx/ssl/
```

3. Create a new .env file by copying the env template with the following command. Follow the information on [Canvas API Key Setup](#canvas-api-key-setup) to fill out the values in your .env
```
$ cp .env.template .env
```

4. Build the project with `./manage.sh build`
```
$ ./manage.sh build
Building Costal images
```

5. Run COSTAL and it's services with `./manage.sh start-attached`.
```
$ ./manage.sh start-attached
Starting Costal in attached mode
docker compose -f docker-compose.yml up
```

6. Run database migrations with `./manage.sh migrate`.
```
$ ./manage.sh migrate
docker compose -f docker-compose.yml run --rm web python manage.py migrate
```

7. To install the tool into your local canvas instance, follow the steps in [Generating LTI Keys](#generating-lti-keys). After finishing the [course deployment](#deploy-to-an-account-or-course), COSTAL should be availible in the course navigation section on the left side of the course it was installed in.

### Canvas API Key Setup

By creating an API key for the application, the tool can access and make changes to any courses it is deployed in. The API key should only have to be set once.

Instructure provides a detailed explanation of the API key creation process [here](https://community.canvaslms.com/t5/Admin-Guide/How-do-I-add-a-developer-API-key-for-an-account/ta-p/259), however simple instructions will be included below.

1. Start your local canvas instance and login. Navigate to **Admin > Site Admin > Developer Keys**. On the Developer Keys page, click **+ Developer Key** to add a new API key.
2. Set the Redirect URIs and Redirect URI (Legacy) to the following URI format.
```
https://localhost/lti/oauth_complete/
```
3. Save the key, and enable it by changing the state to "On".
4. Copy the `API_CLIENT_ID` (# under the details column) and `API_CLIENT_ID_SECRET` (visible after clicking "Show Key") and paste them into your .env file

### Generating LTI Keys

As part of the LTI 1.3 process, COSTAL uses a public and private keypair in order to authenticate into the canvas LMS. To generate a new keypair, use the command below to start the key generation CLI. The first time you generate keys, choose the option to create a new key set. Later, this key set will be associated with a registration of COSTAL into a platform.

```sh
./manage.sh generate-keys 
```

Take note of the ID of the key set that was created or used. You will need this value later.

If you create additional keys in the future, you may create new key sets or add the key to an existing key set. Note that currently COSTAL only uses the first key in a given keyset.

#### Tool Registration

To register COSTAL as an LTI 1.3 tool into a platform, run the following command:

```sh
./manage.sh register
```

If you're using a local canvas instance, choose the first platform option. If you have a seperate hosted canvas service you're deploying, choose the second option and pass in the server url. 

You will be prompted to enter a Client ID. The next section will explain how to get the Client ID from Canvas.

#### Create Developer LTI Key / Get Client ID

1. On your local canvas instance, navigate to **Admin > Site Admin > Developer Keys**. On the Developer Keys page, click **+ Developer Key** and add a new LTI key
2. Ensure the application is running and go to the following url (in a new tab) to get the tool's LTI config JSON. Copy the contents of the page.
```
https://localhost/lti/config
```
3. Back on your local canvas instance, choose the **Paste JSON** method, and paste the applications config JSON. 
4. Save the developer key and enable it by changing the state to "On".
5. Copy the number formatted as "1000000000XXXX" in the details column for the new key you created. This is the tool's Client ID.

#### Finish Registration

Paste the Client ID into the registration script.

Note that Client IDs must be unique for a given issuer and cannot be used multiple times. If you have already registered a Client ID, you do not need to ./manage.sh an additional registration and can make multiple deployments with the existing registration.

Select which key set you would like to use. Typically, this will be the one you created earlier in the process.

#### Deploy to an Account or Course

1. First, head into the course you wish to install the LTI in on your local canvas instance. Navigate to **Settings > Apps** and click the blue "+ App" button.
2. Set the configuration type to "By Client ID" and paste in the client ID from your LTI key before.
3. On the new app, click the gear icon and then click "Deployment ID". Copy this value as it will be used in the deploy step.
4. Run the following command to start the deployment process:
```sh
./manage.sh deploy
```
5. Select which registration you'd like to use for this deployment. Typically, it will be the one you created in the previous section. When prompted, paste the deployment ID you copied earlier.

## Production Deployment

To ease the process of setting the cloud infrastructure required to run COSTAL, `.tf` scripts are provided in the `iac/` directory for use with either OpenTofu of Terraform. For these instructions we will be using OpenTofu.

1. Install and setup OpenTofu using the instructions [here](https://opentofu.org/docs/intro/install/)

2. Create an S3 bucket named `costal-tf-state` in the `us-east-1` region to store the Terraform state file.

3. Create a DynamoDB table named `costal-tf-locks` with a primary key of `LockID` (type: String) to enable state locking and consistency.

4. Use Route53 to obtain an ACM cert for SSL on your domain name. This is required for the LTI launch process with Canvas.

5. Change into the `iac/` directory and initialize OpenTofu.
```sh
cd iac/
tofu init
```

6. After the initalization is complete you can apply the changes with `apply` while passing in the certificate_arn from step 4 (The ACM arn is not required in case you want to test the application over HTTP). You will be prompted to input a password for the database. **DO NOT LOSE THIS PASSWORD** as it cannot be recovered without recreating the db instance.
```sh
tofu apply -var="certificate_arn=arn:aws:acm:us-east-1:123456789012:certificate/EXAMPLE"
```

7. If you ever need to take down the cloud infrastructure, it can be removed with.
```sh
tofu destroy
```

### Deployment Script

Once you have the necessary cloud infrastructure setup, we need to build the application and push it to AWS. Typically this is done through the Github Actions script in `.github/workflows/deploy.yml` everytime a push is made to the `main` branch. However, if you simply want to do this process manually, a `devops/deploy.py` script is provided.

1. Copy and fill out your `.deploy.env` file with the AWS IDs and ARNs of the various resources. You can use the `COMMIT_TAG` variable to specify the version number of the build.
```sh
cp devops/.deploy.env.template devops/.deploy.env
```

2. Run the deploy script to initiate the build process.
```sh
python devops/deploy.py
```
