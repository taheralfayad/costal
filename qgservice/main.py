import json
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from qgservice.engine import LLMEngine

app = FastAPI()
llm_service = LLMEngine()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],  # Allows requests from the frontend on port 3000
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods, including OPTIONS
    allow_headers=["*"],  # Allows all headers
)


class QuestionGenerationRequest(BaseModel):
    course_name: str
    text: str
    num_questions: int
    previous_questions: list


class ChatRequest(BaseModel):
    message: str


class HintRequest(BaseModel):
    message: str


@app.get("/")
async def root():
    return {"message": "QG Service"}


@app.post("/generate")
async def generate(request: QuestionGenerationRequest):
    try:
        questions_json = llm_service.generate_questions(
            course_name=request.course_name,
            topic=request.topic,
            num_questions=request.num_questions,
            previous_questions=request.previous_questions,
        )

        return json.loads(questions_json)

    except Exception as e:
        print("ERROR IN GENERATE ENDPOINT")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        chatbot_reply = llm_service.generate_chat_response(request.message)

        return {"reply": chatbot_reply}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate_hint")
async def generate_hint(request: HintRequest):
    try:
        hint = llm_service.generate_hint(request.message)

        return {"hint": hint}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
