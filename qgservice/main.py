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
    
class ChatRequest(BaseModel):
    message: str

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
    
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        # Use LLMEngine to generate a response based on user message and history
        chatbot_reply = llm_service.generate_chat_response(request.message)
        
        return {"reply": chatbot_reply}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
