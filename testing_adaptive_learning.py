import os
import random

import pandas as pd
import requests

import pyBKT.models as pybkt
from sklearn.model_selection import train_test_split


model = pybkt.Model(seed=42, num_fits=1)

if not os.path.exists("./as.csv"):
    model.fetch_dataset(
        "https://raw.githubusercontent.com/CAHLR/pyBKT-examples/master/data/as.csv", "."
    )

as_df = pd.read_csv("./as.csv", encoding_errors="ignore")

objectives_to_be_tested_in_quiz = [22, 27, 32]


def get_questions(skil_ids):
    return as_df[as_df["skill_id"].isin(skil_ids)]


questions = get_questions(objectives_to_be_tested_in_quiz)

train_questions, test_questions = train_test_split(
    questions, test_size=0.2, random_state=42, stratify=questions["skill_name"]
)

train_questions = train_questions.drop(columns=["skill_name"])
test_questions = test_questions.drop(columns=["skill_name"])

train_questions = train_questions.rename(columns={"skill_id": "skill_name"})
test_questions = test_questions.rename(columns={"skill_id": "skill_name"})

train_questions["skill_name"] = train_questions["skill_name"].astype(int).astype(str)
test_questions["skill_name"] = test_questions["skill_name"].astype(int).astype(str)


COURSE_ID = 101
MODULE_ID = 1
ADAPTIVE_ENGINE_URL = os.getenv("ADAPTIVE_ENGINE_URL", "http://localhost:8000")

test_questions["difficulty"] = test_questions.apply(
    lambda _: random.randint(1, 3), axis=1
)


# Fit the BKT model for the module
if not os.path.exists(
    f"./adaptive-engine-api/models/bkt_model_{COURSE_ID}_{MODULE_ID}.pkl"
):
    for _, question in train_questions.iterrows():
        request = {
            "user_id": question["user_id"],
            "course_id": COURSE_ID,
            "module_id": MODULE_ID,
            "skill_name": question["skill_name"],
            "correct": question["correct"],
        }

        response = requests.post(f"{ADAPTIVE_ENGINE_URL}/fit-model/", json=request)
else:
    model.load(f"./adaptive-engine-api/models/bkt_model_{COURSE_ID}_{MODULE_ID}.pkl")
    print(model.coef_)
    training_rmse = model.evaluate(data=train_questions)
    training_auc = model.evaluate(data=train_questions, metric="auc")

    # Print the number of attempts per skill
    print(train_questions.groupby("skill_name").size())

    print(f"Training RMSE: {training_rmse}")
    print(f"Training AUC: {training_auc}")

ASSIGNMENT_ID = 1

# Add arms to the MAB model
if not os.path.exists(
    f"./adaptive-engine-api/models/mab_model_{COURSE_ID}_{ASSIGNMENT_ID}.pkl"
):
    for _, question in test_questions.iterrows():
        request = {
            "question_id": question["problem_id"],
            "assignment_id": ASSIGNMENT_ID,
            "course_id": COURSE_ID,
        }

        response = requests.post(f"{ADAPTIVE_ENGINE_URL}/add-arm-to-mab/", json=request)

attempts_per_skill = {
    "22": [0, 0],
    "27": [0, 0],
    "32": [0, 0],
}


question_id = None
reward = 0
attempt = 0

while (
    attempts_per_skill["22"][1] < 0.95
    or attempts_per_skill["27"][1] < 0.95
    or attempts_per_skill["32"][1] < 0.95
):
    if question_id is None:
        question = test_questions.sample(n=1).iloc[0]
        question_id = question["problem_id"]
    else:
        question_id = question_id
        question = test_questions[test_questions["problem_id"] == question_id].iloc[0]

    request = {
        "user_id": int(question["user_id"]),
        "course_id": int(COURSE_ID),
        "assignment_id": int(ASSIGNMENT_ID),
        "skill_name": question["skill_name"],
        "correct": int(question["correct"]),
        "difficulty": int(question["difficulty"]),
        "hints_used": int(question["hint_count"]),
        "seconds_taken": int(question["ms_first_response"]),
        "module_id": int(MODULE_ID),
        "question_id": int(question["problem_id"]),
    }

    response = requests.post(
        f"{ADAPTIVE_ENGINE_URL}/run-model-on-response/", json=request
    )
    attempts_per_skill[question["skill_name"]][0] += 1
    attempts_per_skill[question["skill_name"]][1] = response.json()["state_prediction"]
    question_id = response.json()["next_question"]
    reward += response.json()["reward"]
    print("--------------------")
    print("ATTEMPT # {x} Summary".format(x=attempt))
    print("Total Reward: {x}".format(x=reward))
    print("Skill Tested: {x}".format(x=question["skill_name"]))
    print("State Prediction: {x}".format(x=response.json()["state_prediction"]))
    print("--------------------")
    attempt += 1

print("FINAL RESULT:")
print(attempts_per_skill)
print(reward)
