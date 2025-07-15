# The API to the energidataservice.dk platform enables users free of charge to download data for further processing. The platform does not have unlimited resources and do have limitations as described below. It is not meant as the source for all units for vendor applications. In this situation the vendor must download data and then be the source of all possible units for the application.

Request methods
The restful API is a synchronous interface with Http Get. Parameters are a part of the URI string.
To get data:

https://api.energidataservice.dk/dataset/{name of dataset}?
or to get metadata:

https://api.energidataservice.dk/meta/dataset/{dataset | group | organization}?
followed by Parameter Name = Parameter Value, where each pair of parameter name and value are separated by &.

Build your request URL
To get a graphical guide to the API, you can access our swagger documentation.

Query the API
The Energi Data Service platform web API can be accessed via web browser using the Get method. The following example returns data for Price area = DK1 for May, 2022 for the DeclarationProduction dataset:

https://api.energidataservice.dk/dataset/DeclarationProduction?start=2022-05-01&end=2022-06-01&filter={"PriceArea":["DK1"]}
Below the description of Parameters and Limits you can see more examples of requests and their output using the different parameters.

Parameters
Only equal operator is available for all parameters.
Both ASCII characters and URL-encoding forms may be used.

start
Specifies the start point of the period for the data request. The period is selected based on the column given by the Time range column, which is specific to the dataset. The start point is included in the output. Example: "start=2022-07-01".

Datetime formats which may be used: "yyyy", "yyyy-MM", "yyyy-MM-dd", "yyyy-MM-ddTHH:mm"

The date and time refer to the Danish timezone.

You can also provide a dynamic timestamp that is relative to the current point in time. To do so the value should follow this format: {now | StartOfDay | StartOfMonth | StartOfYear}{+(written as %2B)) | -}{ISO_8601 duration}. "start=now" will set the starting point to now. "start=now-P1D" will set the starting point to 1 day before now Danish time. For timestamps in the future, write %2B instead of +. For instance start=now%2BP1D will set the starting point to 1 day after now Danish time.

end
Specifies the end point of the period for the data request. The period is selected based on the column given by the Time range column. The end point is excluded from the output. Example: "end=2022-08-01".

columns
Optional - comma separated list of columns. If left blank all columns are included. Example: "columns=HourUTC,PriceArea,CO2Emis".

filter
Json object of key/value pairs where keys are column names and values are json arrays of possible values for that column.
Example: filter={"DK36Code":["QB"],"DK19Code":["Q"]} will return data where both conditions are met.
Example: filter={"PriceArea":["DK1","DK2"]} will return data where "PriceArea" is either "DK1" or "DK2".

Single quotes in strings: In order to filter values containing single quotes, replace the single quote (') with two quotes ('').

sort
Comma separated list of columns to sort by. Example: "sort=HourUTC desc,PriceArea". If left blank the output is sorted descending according to the unique key (e.g. HourUTC or Minutes5UTC) by default. If the sort parameter is set, the default sort order is ASC (ascending). E.g. "sort=CO2Emission" will sort ascending and "sort=CO2Emission desc" will sort descending.

offset
Number of records to skip. Example: "offset=30".

limit
Maximum number of records to return. Example: "limit=30".
"limit=0" returns all records. If neither "start" nor "limit" is provided a default value of 100 is used.

Limits on Requests
A maximum of 40 requests are accepted per user per 10 seconds. The count of requests is performed based on per IP address. Reaching the 40 query per 10 seconds limit through a unique IP address will result in a temporary ban of 5 minutes.
When a user reaches the limit, requests coming from the user will return HTTP Status 429 - TOO MANY REQUESTS with message text Max allowed requests per 10 seconds from each unique IP is max up to 40 only.

Examples
Below you can see examples of requests and their output using the different parameters.
Note that limit is added in all requests to limit the outputs of the examples. To use the request URL without limitations remove "&limit=4".
Also note that the outputs are displayed in descending order according to the unique key (e.g. HourUTC or Minutes5UTC) by default.

start and end
To get the first hour of January 1st 2022 from the dataset CO2 Emission:

https://api.energidataservice.dk/dataset/CO2Emis?start=2022-01-01T00:00&end=2022-01-01T01:00&limit=4
keyboard_arrow_down
View output example
Start of year as start point
Using the startOfYear value as a starting point

https://api.energidataservice.dk/dataset/CO2Emis?start=StartOfYear&end=now&limit=4
keyboard_arrow_down
View output example
Dynamic start and end
To get the last year from the dataset CO2 Emission:

https://api.energidataservice.dk/dataset/CO2Emis?start=now-P1Y&end=now&limit=4
keyboard_arrow_down
View output example
columns
To only get the columns Minutes5DK, PriceArea and CO2Emission from the dataset CO2 Emission:

https://api.energidataservice.dk/dataset/CO2Emis?columns=Minutes5DK,PriceArea,CO2Emission&limit=4
keyboard_arrow_down
View output example
filter
To get data from either DK1 or DK2 from the dataset CO2 Emission:

https://api.energidataservice.dk/dataset/CO2Emis?filter={"PriceArea":["DK1","DK2"]}&limit=4
keyboard_arrow_down
View output example
sort
If set default sort order is ascending.

To sort by CO2 emission value in descending order:

https://api.energidataservice.dk/dataset/CO2Emis?sort=CO2Emission desc&limit=4
or (the space between the value and sort order may be replaced with %20 as Both ASCII characters and URL-encoding forms may be used):

https://api.energidataservice.dk/dataset/CO2Emis?sort=CO2Emission%20desc&limit=4
keyboard_arrow_down
View output example
sort by two columns
To sort by Price area and CO2 emission:

https://api.energidataservice.dk/dataset/CO2Emis?sort=PriceArea,CO2Emission&limit=4
keyboard_arrow_down
View output example
Combination of parameters start, end, columns, filter, sort and limit
To get only the first 4 rows of data from the first hour of January 1st 2022, only the columns Minutes5DK, PriceArea and CO2Emission and only PriceArea DK1, sorted by CO2Emission value in descending order:

https://api.energidataservice.dk/dataset/CO2Emis?start=2022-01-01T00:00&end=2022-01-01T01:00&columns=Minutes5DK,PriceArea,CO2Emission&filter={"PriceArea":["DK1"]}&sort=CO2Emission desc&limit=4
keyboard_arrow_down
View output example
offset
To not include the first 10 rows of the dataset CO2 Emission:

https://api.energidataservice.dk/dataset/CO2Emis?offset=10&limit=4
timezone
To get the first hour of January 1st 2022 from the dataset CO2 Emission using UTC time zone:

https://api.energidataservice.dk/dataset/CO2Emis?start=2022-01-01T00:00&end=2022-01-01T01:00&timezone=UTC&limit=4
keyboard_arrow_down
View output example
Download URL
It is possible to download data directly in the formats xlxs, json or csv by adding download?format=filetype after the name of the dataset and before the chosen parameters.

To download Excel: download?format=XL

https://api.energidataservice.dk/dataset/CO2Emis/download?format=XL&limit=10

To download json: download?format=json or download? (as json is default)

https://api.energidataservice.dk/dataset/CO2Emis/download?format=json&limit=10

To download csv: download?format=csv

https://api.energidataservice.dk/dataset/CO2Emis/download?format=csv&limit=10

Build Request Data url (Swagger): https://api.energidataservice.dk/index.html