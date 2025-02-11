# Polarity Google BigQuery Integration

Polarity's BigQuery integration can search your BigQuery resources using Google SQL.

| ![](assets/details.png) |![](assets/table.png)|
|---|---|
|*Customized Details View* |*Table view of data*|

## Configuring the Integration

You will need to configure a Google service account key using the following steps.

#### Create the Project and Service Account

Before you can use the Polarity Google BigQuery Integration you will need to go to the [Google Developers Console](https://console.developers.google.com/) and create a new project or use an existing project.

After the project has been created, from the left menu, select `Credentials`, then `Create credentials`. Select `Service Account` from the type of credentials list. Provide a `Service Account Name` such as "Polarity BigQuery Integration" as well as an optional description.

Click on the Service Account and navigate to `Keys` -> `Create New Key` and select JSON. This will download a JSON file containing the private key for the service account which you will then paste into the "Google IAM Service Account Private Key" option.

<img src="assets/create-key.png" width="50%">

#### Enable the API

Next we need to enable the API which will be used with this service account. Using the search bar at the top of the page, search for "bigquery api" and then select the "BigQuery API".  Click on the "Enable" button to enable the API for your project.

<img src="assets/enable-api.png" width="50%">

## Google BigQuery Integration Options

### Google IAM Service Account Private Key

A Google IAM Service Account Private Key in JSON format. Provide the full content of the Service Account Private Key in JSON format (including newlines). This option should be set to "Only Admins can View and Edit".

An example of the private key in JSON format is:

```json
{
  "type": "service_account",
  "project_id": "useful-night-165343-n3",
  "private_key_id": "4ba1234e9824f197b15a2b85c28345a7846f1c748",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...<ADDITIONAL_KEY_CONTENT>...\n-----END PRIVATE KEY-----\n",
  "client_email": "polarity-bigquery-integration@useful-night-165343-n3.iam.gserviceaccount.com",
  "client_id": "194857203948574392843",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/polarity-bigquery-integration%40useful-night-165343-n3.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

### Search Query

The search query to execute written in GoogleSQL.  The query should use the named parameter `@entity` which will be replaced by the entity recognized on the user's screen.  The integration limits all queries to a max of 100 records returned, but you can further limit the number of records returned by your query using the `LIMIT` keyword.

As an example, the following query will return the first 10 results where the `as_domain` column is equal to the searched entity.

```
SELECT * FROM `useful-night-165343-n2.ipinfo___free_ip_to_country_and_asn_database.country_asn` WHERE as_domain=@entity LIMIT 10;
```

> Using the integration's Data Types page, disable any data types that are not valid for the query to reduce the number of queries sent to BigQuery.  For example, if you are looking up a row by domain, disable all other Data Types other than domain.

### Summary Fields

Comma delimited list of field names to include as part of the summary tags. JSON dot notation can be used to target nested fields. Fields must be returned by your search query to be displayed. You can change the label for your fields by prepending the label to the field path and separating it with a colon (i.e., "<label>:<json path>"). If left blank, a result count will be shown. This option should be set to "Lock and hide option for all users".

For example, to display `as_domain` from the previous example query as a summary field you would do:

```
as_domain
```

If you wanted to include a label you would do:

```
AS Domain:as_domain
```

### Maximum Number of Summary Fields

The maximum number of summary field tags to display in the Overlay Window before showing a count.

### Details Fields

Comma delimited list of field names to include as part of the details block. JSON dot notation can be used to target nested fields. Fields must be returned by your search query to be displayed. You can change the label for your fields by prepending the label to the field path and separating it with a colon (i.e., "<label>:<json path>"). If left blank, all fields will be shown in tabular format. This option should be set to "Lock and hide option for all users".

For example, to display three fields called 'start_ip', 'end_ip', 'country_name' you could do:

```
Start IP:start_ip, End IP:end_ip, Country Name:country_name 
```

### Document Title Field

Field to use as the title for each returned document in the details template. This field must be returned by your search query.  Defaults to displaying a Row Number for the returned result.

## Installation Instructions

Installation instructions for integrations are provided on the [PolarityIO GitHub Page](https://polarityio.github.io/).

## Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making.  For more information about the Polarity platform please see:

https://polarity.io/
