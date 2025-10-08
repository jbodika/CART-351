# This is a sample Python script.
import requests
import colorama
from rich import print

city = input()  # Gather user input

try:
    token = '09a175890975d9c88fdad2955206f314be44b6f9'  # ENTER TOKEN HERE
    url = f'https://api.waqi.info/feed/{city}'
    response = requests.get(url, params={'token': token})
except Exception:
    print('err: dont exist')
else:
    results = response.json()
    # print('\n', results)
    results_data = results['data']
    print(results_data
          )
forecast = results_data['forecast']
iaqi_data = results_data["iaqi"]

for key, val in iaqi_data.items():
    print("")
dominentpol_val = results_data['dominentpol']
print(dominentpol_val)
# dominant_pollutant_value = iaqi_data[dominentpol_val]["v"]
# print("Dominant pollutant value:", dominant_pollutant_value)


# ok???????
