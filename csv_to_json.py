import csv
import json
import os

# ఫైల్స్ ఉన్న లోకేషన్లు
csv_file_path = r"c:\xampp\htdocs\chakra\QA_database.csv"
json_file_path = r"c:\xampp\htdocs\chakra\data.json"

data = []

try:
    with open(csv_file_path, mode='r', encoding='utf-8-sig') as csv_file:
        reader = csv.DictReader(csv_file)
        
        for row in reader:
            # CSV లోని డేటాను మనకు కావలసిన JSON స్ట్రక్చర్ (Dictionary) లోకి మార్చడం
            entry = {
                "Q_no": str(row["Q_no"]).strip(),
                "Chakra_Name": {
                    "kn": str(row["Chakra_Name_kn"]).strip(),
                    "te": str(row["Chakra_Name_te"]).strip(),
                "en": str(row["Chakra_Name_en"]).strip(),
                 "sa": str(row["Chakra_Name_sa"]).strip()
                },
                "karaka_name": {
                    "kn": str(row["karaka_name_kn"]).strip(),
                    "te": str(row["karaka_name_te"]).strip(),
                "en": str(row["karaka_name_en"]).strip(),
                 "sa": str(row["karaka_name_sa"]).strip()
                },
                "karaka_no": str(row["karaka_no"]).strip(),
                "chakra_result": {
                    "kn": str(row["chakra_result_kn"]).strip(),
                    "te": str(row["chakra_result_te"]).strip(),
                "en": str(row["chakra_result_en"]).strip(),
                 "sa": str(row["chakra_result_sa"]).strip()
                }
            }
            data.append(entry)

    # JSON ఫైల్ లోకి డేటాను వ్రాయడం
    with open(json_file_path, mode='w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, indent=4)

    print(f"✅ విజయం! CSV డేటా విజయవంతంగా JSON కి మార్చబడింది.\nఫైల్ సేవ్ అయిన ప్రదేశం: {json_file_path}")

except Exception as e:
    print(f"❌ ఏదో పొరపాటు జరిగింది: {e}")