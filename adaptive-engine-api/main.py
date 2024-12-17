from fastapi import FastAPI
import uvicorn

import pandas as pd
import pyBKT.models as pybkt

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/healthcheck/")
def healthcheck():
    return {"status": "ok"}


@app.post("/run-model-on-response/")
def run_model_on_response(
    user_id: int,
    skill_name: str,
    correct: int
):
    model = pybkt.Model(seed=42, num_fits=1)
    model.load(loc='fitted_model.pkl')

    data = pd.DataFrame(
        {
            'user_id': [user_id],
            'skill_name': [skill_name],
            'correct': [correct]
        }
    )

    predictions = model.predict(data=data)
    model.fit(data=data)
    model.save('fitted_model.pkl')

    prediction_json = {
        "state_prediction": predictions.iloc[0]['state_predictions'],
    }

    return prediction_json



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)