import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from engine import LLMEngine

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
            course_name=request.course_name, text=request.text
        )

        return json.loads(questions_json)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
