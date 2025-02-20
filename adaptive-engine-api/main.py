from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

import pandas as pd
import pyBKT.models as pybkt

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


class ModelRequest(BaseModel):
    user_id: int
    skill_name: str
    correct: int


@app.post("/run-model-on-response/")
def run_model_on_response(request: ModelRequest):
    model = pybkt.Model(seed=42, num_fits=1)
    model.load(loc="fitted_model.pkl")

    data = pd.DataFrame(
        {
            "user_id": [request.user_id],
            "skill_name": [request.skill_name],
            "correct": [request.correct],
        }
    )

    model.fit(data=data)
    predictions = model.predict(data=data)
    model.save("fitted_model.pkl")

    prediction_json = {
        "state_prediction": predictions.iloc[0]["state_predictions"],
    }

    return prediction_json


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
