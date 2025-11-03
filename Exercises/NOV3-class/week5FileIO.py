import json

rainbow_file = open("files/rainbow.txt", 'r')
# print(rainbowFile.read())
out = rainbow_file.read(4)
# print(out)
rainbow_file.seek(0)  # test with seek
out_2 = rainbow_file.read()
# print(out_2)
rainbow_file.close()

# read a file
rainbow_file = open("files/rainbow.txt", 'r')
outlines = rainbow_file.readline()
print(outlines)
# write to a file
# sample_file = open("sample_text.txt", 'w')

# for i in range(3):
#     a_name = input("enter animal: ")
#     sample_file.write(f"{a_name}\n")
#
# sample_file.close()

# write lines from array to a file
# animal_list = []
# for i in range(3):
#     a_name = input("enter animal: ")
#     animal_list.append(f"{a_name}\n")
# sample_file.writelines(animal_list)
# sample_file.close()

# appending to a file
# sample_file_a = open("files/sample_text.txt", 'a')
# name_list = []
# for i in range(3):
#     name = input("enter a name: ")
#     name_list.append(f"{name}\n")
# sample_file_a.writelines(name_list)
# sample_file_a.close()

## ---------------------------------

# Read from file and parse JSON
jsonFile = open("files/test.json", "r")
data = json.load(jsonFile)
print(data)
print(type(data))  # a list

json_str = '{"name":"Sabs", "fav_col":"red", "fav_city":"montreal"}'
data_2 = json.loads(json_str)
print(data_2)
print(type(data_2))  # converts to a dict

data_toSave = {"name": "mandy", "fav_col": "blue", "fav_city": "winnipeg"}
# convert dictionary to str
jsonStr = json.dumps(data_toSave, indent=4)
# open or create if non existent
fileOpen = open("files/new_sample.json", "w")
fileOpen.write(jsonStr)

jsonFile = open("files/new_sample_b.json", "w")
data_toSave_2 = {"name": "mandy", "fav_col": "blue", "fav_city": ["list", 3, 4, True, "abc"]}
json.dump(data_toSave_2, jsonFile, indent=4)
