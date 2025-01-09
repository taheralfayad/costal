import pickle

from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

import pandas as pd
import pyBKT.models as pybkt
from mabwiser.mab import MAB, LearningPolicy, NeighborhoodPolicy
from sklearn.preprocessing import StandardScaler

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
    correct: int
    questions: list

class FitModelRequest(BaseModel):
    user_id: int
    course_id: int
    assignment_id: int
    module_id: int
    skill_name: str
    skill_id: int
    question_id: int
    correct: int


@app.post("/run-model-on-response/")
def run_model_on_response(request: RunModelOnResponseRequest):
    model = pybkt.Model(seed=42, num_fits=1)
    model.load('./models/bkt_model_{course_id}_{module_id}.pkl'.format(course_id=request.course_id, module_id=request.module_id))

    try:
        with open("./models/mab_model_{course_id}_{assignment_id}_{user_id}.pkl".format(course_id=request.course_id, assignment_id=request.assignment_id, user_id=request.user_id), "rb") as f:
            mab = pickle.load(f)
    except:
        mab = MAB(arms=[], learning_policy=LearningPolicy.LinUCB(alpha=1.25, l2_lambda=1))
    

    if len(mab.arms) < len(request.questions):
        set_of_mab_arms = set(mab.arms)

        for question in request.questions:
            if question not in set_of_mab_arms:
                mab.add_arm(question

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

    arms = request.questions

    mab = 

    delta = predictions_after.iloc[0]['state_predictions'] - predictions_before.iloc[0]['state_predictions']

    model.save('./models/bkt_model_{course_id}_{user_id}.pkl'.format(course_id=request.course_id, user_id=request.user_id))

    prediction_json = {
        "state_prediction": predictions.iloc[0]['state_predictions'],
    }

    return prediction_json


@app.post("/fit-model")
def fit_model(request: FitModelRequest):
    """
    Online fit the BKT model during initial assessment
    phase for every module
    """
    # First try to load the BKT and MAB model if they are already available
    pybkt = pybkt.Model(seed=42, num_fits=1)
    try:
        file_name = './models/bkt_model_{course_id}_{module_id}.pkl'.format(course_id=request.course_id, module_id=request.module_id)
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
    bkt_filename = './models/bkt_model_{course_id}_{module_id}.pkl'.format(course_id=request.course_id, module_id=request.module_id)
    bkt.save(bkt_filename)

    return {"message": "Model fit successfully"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)