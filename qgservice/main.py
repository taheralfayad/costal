import json
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from qgservice.engine import LLMEngine

app = FastAPI()
llm_service = LLMEngine()

class QuestionGenerationRequest(BaseModel):
    course_name: str
    text: str

@app.get("/")
async def root():
    return {"message": "QG Service"}

@app.post("/generate")
async def generate(request):
    try:
        questions_json = llm_service.generate_questions(
            course_name=request.course_name, topic=request.topic, num_questions=request.num_questions, previous_questions=request.previous_questions
        )

        return json.loads(questions_json)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
