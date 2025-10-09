"""
Author: @Jolene Bodika
Description: This program uses the World Air Quality Index API.
This program is a CLI interactive story where you go on vacation with your friend.
Course: Networks and Navigation
Course Number: CART 361
"""
import requests
import time
from rich import print
from rich.console import Console
from rich.table import Table
import sys
from colorama import Fore, Style


# Function to prompt the user for the city
def prompt_for_city():
    city = input("What city are we in? Sorry I forgot the name...\n")  # Gather user input

    # Displays the loading animation
    for _ in range(5):
        print(".", end="")
        time.sleep(0.3)

    return city


# Function to make the API request
def api_request(city):
    token = '09a175890975d9c88fdad2955206f314be44b6f9'
    url = f'https://api.waqi.info/feed/{city}'  # Dynamically make a request to the API
    response = requests.get(url, params={'token': token})

    results = response.json()

    if results["status"] == "ok":
        return results["data"]
    else:
        print(f"{Fore.RED}\nCould not retrieve data from the API{Style.RESET_ALL}")
        exit(-1)


# Function to display the table with the weather data and AQI
def display_city_info(results):
    console = Console()  # create Console object
    # Get Data from the results to print out a report
    weather = results['iaqi']
    city = results['city']['name']
    temperature = weather['t']['v'] if 't' in weather else "N/A"
    humidity = weather['h']['v'] if 'h' in weather else "N/A"
    aqi = results['aqi']
    dom_poll = results['dominentpol']

    # Determine AQI category and health implications
    if 0 <= aqi <= 50:
        aqi_level = "Good"
        health_implication = "Air quality is considered satisfactory, and air pollution poses little or no risk"
    elif 51 <= aqi <= 100:
        aqi_level = "Moderate"
        health_implication = (
            "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a "
            "very small number of people who are unusually sensitive to air pollution.")

    elif 101 <= aqi <= 150:
        aqi_level = "Unhealthy for Sensitive Groups"
        health_implication = ("Members of sensitive groups may experience health effects. "
                              "The general public is not likely to be affected.")

    elif 151 <= aqi <= 200:
        aqi_level = "Unhealthy"
        health_implication = (
            "Everyone may begin to experience health effects; members of sensitive groups may experience more serious "
            "health effects")

    elif 201 <= aqi <= 300:
        aqi_level = "Very Unhealthy"
        health_implication = (
            "Health warnings of emergency conditions. The entire population is more likely to be affected.")

    else:
        aqi_level = "Hazardous"
        health_implication = "Health alert: everyone may experience more serious health effects"

    # Create table
    table = Table(title=f"Air Quality and Weather Data for {city}")

    table.add_column("Parameter", style="cyan", no_wrap=True)
    table.add_column("Value", style="white")

    table.add_row("Temperature", f"{temperature} °C")
    table.add_row("Humidity", f"{humidity} %")
    table.add_row("AQI", str(aqi))
    table.add_row("Dominant Pollutant", dom_poll)
    table.add_row("AQI Level", f"{aqi_level}")
    table.add_row("Health Implication", f"{health_implication}")

    console.print(table)  # displays the table in the console


# Function for the walk scenario
def walk_scenario(results):
    weather = results['iaqi']
    temperature_value = int(weather['t']['v'])  # Temperature in °C
    weather_icon = ''  # placeholder variables
    final_icon = ""
    ice_cream_icon = "🍨"

    if temperature_value < 15:  # The icons will change based on the current temperature
        weather_icon = "❄️"
        final_icon = "🧊"
    else:
        weather_icon = "🔥️"
        final_icon = "💧"

    prompt_watch_item = input("Can you look after my ice cream please? (y/n)")

    if prompt_watch_item.lower() != 'y':
        print(f"{Fore.RED}You're very rude today.{Style.RESET_ALL}")
        return

    # Number of icons must reflect the temperature value
    weather_icon_count = temperature_value // 2  # rounds the value and discards the remainder

    print("Awesome! I'll be back in a few, just make sure nothing happens to it!")
    print(ice_cream_icon)
    time.sleep(2)
    # Display ice cream

    # Animate icon growing under the ice cream
    for step in range(1, weather_icon_count + 1):  # based on the weather count value it will display fire/snowflake
        # icons under the ice cream

        print(weather_icon * step)  # moves the icon
        time.sleep(0.3)
        if step != weather_icon_count:
            sys.stdout.write("\033[F\033[K")  # clears the line from the console

    sys.stdout.write("\033[F\033[K")  # Clear last line
    sys.stdout.write("\033[F\033[K")
    print(final_icon)  # display the state of the ice cream
    if temperature_value >= 15:
        print(f"\nWhere's my ice cream... 😒")
    else:
        print(f"I think it might be too cold for me to eat this ice cream now 🥶")


# Function for the ice cream scenario
def ice_cream_scenario(results):
    wind = results['iaqi']
    # check if wind value exists in the data
    if "w" in wind:
        wind_speed = int(wind['w']['v'])

        hat_icon = '🎩'
        wind_icon = "💨"
        # prompt user
        prompt_watch_item = input(
            "Can you watch over my hat? I promise, I'll be back in a few minutes! (y/n)\n")

        # check if user agreed
        if prompt_watch_item.lower() == 'y':
            print(f"Great! please be careful and don't lose it.\n")
            sys.stdout.write(hat_icon)
            time.sleep(1)
            # check if wind speed exists and is more than one
            if wind_speed is not None and wind_speed > 0:

                sys.stdout.flush()  # removes hat icon from console
                time.sleep(1)
                # moves the hat and wind based on the speed of the wind from the city
                for i in range(int(wind_speed * 5)):
                    sys.stdout.write("\r" + " " * i + wind_icon + hat_icon)
                    sys.stdout.flush()
                    time.sleep(1 / max(wind_speed, 1))  # the higher the wind the faster it moves

                print(f"\n{Fore.RED}HEY?!?! Where did my hat go?.{Style.RESET_ALL}")

            else:
                time.sleep(1)
                print("Oh look at that. My hat is still here!")

        else:
            print(f'{Fore.RED}How dare you 😤....{Style.RESET_ALL}')

    else:
        print("I don't feel like going on a walk right now, how about some ice cream?")
        return


# Main Function
def main():
    city = prompt_for_city()  # user input for the city
    data = api_request(city)  # gets data from API

    if not data:
        exit(-1)  # exits program

    print(
        f"\n{city}! That's right! We should explore the city today.\nI think we can grab some ice cream"
        f" and i'll bring my favourite hat.\nWait before we go, how's the weather?")

    while True:
        # Prompts a user to pick a scenario
        option = int(input(
            f"\n{Fore.MAGENTA}Option 1{Style.RESET_ALL} - Let's get some ice cream.\n"
            f"{Fore.MAGENTA}Option 2{Style.RESET_ALL} - Let's go for a walk.\n{Fore.MAGENTA}"
            f"Option 3{Style.RESET_ALL} - Check the weather\n\n"))
        if option == 1:
            walk_scenario(data)
        elif option == 2:
            ice_cream_scenario(data)
        elif option == 3:
            display_city_info(data)
        else:
            print("Invalid option")

        # Ask user if they would like to play again
        replay = input("Do you want to choose another scenario? (y/n) ").lower()
        if replay != "y":
            print(
                f"\n{Fore.LIGHTRED_EX}I don't think I like {city} as much as you do.. "
                f"Let's try somewhere else next time...{Style.RESET_ALL}")
            break


if __name__ == "__main__":
    main()
