import pickle

from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

import pandas as pd
import pyBKT.models as pybkt
from mabwiser.mab import MAB, LearningPolicy, NeighborhoodPolicy

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}


class RunModelOnResponseRequest(BaseModel):
    user_id: int
    course_id: int
    assignment_id: int
    module_id: int
    skill_name: str
    seconds_taken: int
    percentage_of_last_five_correct: int
    difficulty: int
    hints_used: int
    correct: int
    questions: list
    question_id: int

class FitModelRequest(BaseModel):
    user_id: int
    course_id: int
    assignment_id: int
    module_id: int
    skill_name: str
    skill_id: int
    question_id: int
    correct: int

class AddArmToMABRequest(BaseModel):
    question_id: int
    assignment_id: int
    course_id: int

@app.post("/run-model-on-response/")
def run_model_on_response(request: RunModelOnResponseRequest):
    model = pybkt.Model(seed=42, num_fits=1)
    model.load('./adaptive-engine-api/models/bkt_model_{course_id}_{module_id}.pkl'.format(course_id=request.course_id, module_id=request.module_id))

    try:
        with open("./adaptive-engine-api/models/mab_model_{course_id}_{assignment_id}.pkl".format(course_id=request.course_id, assignment_id=request.assignment_id), "rb") as f:
            mab = pickle.load(f)
    except:
        return {"message": "MAB model not found"}

    set_of_mab_arms = set(mab.arms)

    data = pd.DataFrame(
        {
            'user_id': [request.user_id],
            'skill_name': [request.skill_name],
            'correct': [request.correct]
        }
    )
    
    try:
        predictions_before = model.predict(data=data)
    except:
        predictions_before = pd.DataFrame({'state_predictions': [0]})
    
    model.fit(data=data)
    predictions_after = model.predict(data=data)

    delta = predictions_after.iloc[0]['state_predictions'] - predictions_before.iloc[0]['state_predictions']

    if request.question_id not in set_of_mab_arms:
        mab.add_arm(question)

    arm_context = pd.DataFrame(
        {
            'skill_id': [request.skill_id],
            'seconds_taken': [request.seconds_taken],
            'hints_used': [request.hints_used],
            'difficulty': [request.difficulty],
            'percentage_of_last_five_correct': [request.percentage_of_last_five_correct],
            'bkt_prediction': [predictions_after.iloc[0]['state_predictions']]
        }
    )

    # Reward function is calculated based on the difference in state prediction
    # It is also magnified or reduced based on the difficulty of the question
    if delta > 0:
        multiplier = 1 + (difficulty - 1) * 0.25
    else:
        multiplier = 1 - (difficulty - 1) * 0.25

    reward = pd.Series([delta * multiplier])

    mab.partial_fit(decisions=[request.question_id], rewards=reward, context=arm_context)

    next_question = mab.predict(context=arm_context)

    model.save('./adaptive-engine-api/models/bkt_model_{course_id}_{user_id}.pkl'.format(course_id=request.course_id, user_id=request.user_id))
    with open("./adaptive-engine-api/models/mab_model_{course_id}_{assignment_id}_{user_id}.pkl".format(course_id=request.course_id, assignment_id=request.assignment_id, user_id=request.user_id), "wb") as f:
        pickle.dump(mab, f)

    prediction_json = {
        "state_prediction": predictions.iloc[0]['state_predictions'],
        "next_question": next_question
    }

    return prediction_json


@app.post("/add-arm-to-mab/")
def add_arm_to_mab(request: AddArmToMABRequest):
    try:
        with open("./adaptive-engine-api/models/mab_model_{course_id}_{assignment_id}.pkl".format(course_id=request.course_id, assignment_id=request.assignment_id), "rb") as f:
            mab = pickle.load(f)
    except:
        mab = MAB(arms=[request.question_id], learning_policy=LearningPolicy.LinUCB(alpha=1.25, l2_lambda=1))
        # Save the MAB model
        with open("./adaptive-engine-api/models/mab_model_{course_id}_{assignment_id}.pkl".format(course_id=request.course_id, assignment_id=request.assignment_id), "wb") as f:
            pickle.dump(mab, f)
        
        return {"message": "Arm added to MAB model"}
    
    if request.question_id not in mab.arms:
        mab.add_arm(request.question_id)
        # Save the MAB model
        with open("./adaptive-engine-api/models/mab_model_{course_id}_{assignment_id}.pkl".format(course_id=request.course_id, assignment_id=request.assignment_id), "wb") as f:
            pickle.dump(mab, f)
        
        return {"message": "Arm added to MAB model"}
    
    return {"message": "Arm already exists in MAB model"}


@app.post("/fit-model/")
def fit_model(request: FitModelRequest):
    """
    Online fit the BKT model during initial assessment
    phase for every module
    """
    # First try to load the BKT and MAB model if they are already available
    pybkt = pybkt.Model(seed=42, num_fits=1)
    try:
        file_name = './adaptive-engine-api/models/bkt_model_{course_id}_{module_id}.pkl'.format(course_id=request.course_id, module_id=request.module_id)
        pybkt.load(file_name)
    except:
        pass

    bkt = pybkt.Model(seed=42, num_fits=1)

    data = pd.DataFrame(
        {
            'user_id': [request.user_id],
            'skill_name': [request.skill_name],
            'correct': [request.correct]
        }
    )

    bkt.fit(data=data)
    bkt_filename = './adaptive-engine-api/models/bkt_model_{course_id}_{module_id}.pkl'.format(course_id=request.course_id, module_id=request.module_id)
    bkt.save(bkt_filename)

    return {"message": "Model fit successfully"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)