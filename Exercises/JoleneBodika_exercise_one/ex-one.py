import requests
from colorama import Fore, Style

# Set up request
token = '09a175890975d9c88fdad2955206f314be44b6f9'  # ENTER TOKEN HERE
url = 'https://api.waqi.info/search/'
response = requests.get(url, params={'token': token,
                                     'keyword': 'montreal'})
results = response.json()

print(results)  # displays a dictionary of results

# 5QA: In your script write the code to get the type of the results variable. Run the code and document the answer.
# 5A: <class 'dict'>
print(type(results))

# 5QB: In your script write the code to get the keys of the results variable.
# 5B: <class 'dict'>
print(results.keys())

# Now write the code to access the content associated with the data field.
response_data = results['data']

# Save the result from the expression as a variable called responseData. Then find out the type of responseData
print(response_data)
# response data has all the information stored for the city montreal from the API

# What is the result of running the following code
for item in response_data:
    print(item)
# What does each item represent?
# Each item is a different station in the city

# Write the code to determine the type of the item variable
for item in response_data:
    print(type(item))

# Write the code to determine the keys associated with the item variable
for item in response_data:
    print(item.keys())

# Modify the code above to now print out the name of each station from the responseData. Document the results.
for item in response_data:
    print(Fore.LIGHTBLUE_EX + item['station']['name'] + Style.RESET_ALL + '\nAir Quality Index: ' +
          item['aqi'] + "\nlat:", item['station']['geo'][0], "\nlong:", item['station']['geo'][1], '\n')
# Append the code above to also print out the geolocations of each station from the responseData. Append the code
# above to print out the air quality index for each item AND the uid for each item. The output needs to be neat and
# labelled!

# ACCESSING THE FEED RESULTS
# Set up the request
url_feed = 'https://api.waqi.info/feed/@5468'
response_feed = requests.get(url_feed, params={"token": token})
results_feed = response_feed.json()
print(results_feed)

# So - now write the code to access the content associated with the data field. Save the result from the expression
# as a variable called response_data_feed.
print(results_feed['data'])
response_data_feed = results_feed['data']

# What is the type of the variable?
print(type(results_feed['data']))  # class <'dict'>

# Write a for loop to iterate through the `response_data_feed` variable .
for key, val in response_data_feed.items():
    print(key, ':', val)
# Next write the expression to access the aqi field and the dominentpolfield - Save both values in new variables.
aqi = response_data_feed['aqi']
dominentpol_val = response_data_feed['dominentpol']

# according to the documentation what does this field represent?
# Its the dominant pollutant that effects the air quality for the specific station


# now access you will access the iaqi field. You will see that the result is another dictionary, with keys for
# different pollutants. Each one of those keys—somewhat inexplicably—has another dictionary for its values,
# whose only key (`v`) points to the actual value for that pollutant
iaqi_data = response_data_feed["iaqi"]
print(type(iaqi_data))  # <class 'dict'>

for key, val in iaqi_data.items():
    print(key, ":", val)

dominant_pollutant_value = iaqi_data[dominentpol_val]["v"]
print("Dominant pollutant value:", dominant_pollutant_value)

# explain theoretically (you do not have to write the code) what the process would be to access the value of the
# dominant pollutant value from different cities ...

# You would need to change the keyword in your request to the
# specific city you want to look up. then you can grab the data from the response, store the value of the
# dominent pool then use that value as a key in the iaqi dictionary to get the actual pollutant
