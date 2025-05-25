import json
from gpt import call_gpt

candidates = json.load(open("candidate_intros.json"))

for candidate in candidates:
    response, thinking = call_gpt(candidate["intro"])
    candidate["response"] = response
    candidate["thinking"] = thinking

candidate_intros = json.load(open("candidate_intros.json"))

for candidate in candidates:
    candidate_intros.append(candidate)

json.dump(candidate_intros, open("candidate_intros.json", "w"), indent=4)

print(candidates[0])