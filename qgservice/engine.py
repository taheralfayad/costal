import json
from llama_cpp import Llama
from huggingface_hub import hf_hub_download

DEFAULT_MODEL_ID = "bartowski/Meta-Llama-3.1-8B-Instruct-GGUF"
DEFAULT_FILE_NAME = "Meta-Llama-3.1-8B-Instruct-Q5_K_M.gguf"


class LLMEngine:

    def __init__(
        self,
        repo_id: str = DEFAULT_MODEL_ID,  # Huggingface repoID
        filename: str = DEFAULT_FILE_NAME,  # Must be .gguf
        gpu: bool = False,  # True to use GPU acceleration
        window: int = 2048,  # Num of tokens in context window
    ):
        self.model_path = hf_hub_download(repo_id=repo_id, filename=filename)
        self.llm = llm = Llama(
            model_path=self.model_path, n_gpu_layers=-1 if gpu else 0, n_ctx=window
        )

        self.question_schema = {
            "type": "object",
            "required": ["question", "options", "answer"],
            "properties": {
                "question": {"type": "string"},
                "options": {
                    "type": "object",
                    "required": ["A", "B", "C", "D"],
                    "properties": {
                        "A": {"type": "string"},
                        "B": {"type": "string"},
                        "C": {"type": "string"},
                        "D": {"type": "string"},
                    },
                },
                "answer": {"type": "string"},
            },
        }

    def __call__(self, prompt: str, max_tokens: int, temperature: float):
        return self.llm(prompt=prompt, max_tokens=max_tokens, temperature=temperature)


    def extract_concepts(self, course_name: str, text: str, num_concepts: int = 3):
        concept_schema = {
            "type": "object",
            "properties": {
                "concepts": {
                    "type": "array",
                    "items": {"type": "string"},
                    "minItems": num_concepts,
                    "maxItems": num_concepts,
                }
            },
            "required": ["concepts"],
        }

        prompt = f"""You are an expert in {course_name}. Extract {num_concepts} key concepts from the provided text that are fundamental, clear, relevant, and suitable for challenging students on the course material. Focus on core ideas and avoid minor details.
        Text: '''{text}'''"""

        # Use llama_cpp for text generation with JSON schema
        response = self.llm.create_chat_completion(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert course content analyzer.",
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object", "schema": concept_schema},
            temperature=0.0,
            max_tokens=200,
        )

        # Extract and parse the content
        content = response["choices"][0]["message"]["content"]
        parsed_response = json.loads(content)

        return parsed_response["concepts"]

def generate_questions(self, course_name: str, topic: str, previous_questions: list, num_questions: int) -> str:
      system_instruction = (
          f"You are an expert in {course_name}. Based on the topic '{topic}' and the previously provided questions, generate new challenging multiple-choice questions suitable for assessing student understanding. Ensure the new questions are distinct from previously asked ones. Always provide 4 options (A, B, C, D) in the following JSON Schema: \n"
          "{\"type\": \"object\", \"required\": [\"question\", \"options\", \"answer\"], \"properties\": {\"question\": {\"type\": \"string\"}, \"options\": {\"type\": \"object\", \"required\": [\"A\", \"B\", \"C\", \"D\"], \"properties\": {\"A\": {\"type\": \"string\"}, \"B\": {\"type\": \"string\"}, \"C\": {\"type\": \"string\"}, \"D\": {\"type\": \"string\"}}}, \"answer\": {\"type\": \"string\"}}}"
      )

      previous_questions_text = "\n".join(
          [
              f"Q: {q['question']}\nOptions: A: {q['options']['A']}, B: {q['options']['B']}, C: {q['options']['C']}, D: {q['options']['D']}\nCorrect Answer: {q['answer']}"
              for q in previous_questions
          ]
      )

      prompt = (
          f"Topic: {topic}\n\n"
          f"Previously Asked Questions:\n{previous_questions_text}\n\n"
          f"Generate {num_questions} new questions for this topic."
      )

      response = self.llm.create_chat_completion(
          messages=[
              {"role": "system", "content": system_instruction},
              {"role": "user", "content": prompt},
          ],
          response_format={"type": "json_object", "schema": self.question_schema},
          temperature=0.7,
          max_tokens=300,
      )

      # Process the response
      content = response["choices"][0]["message"]["content"]

      try:
          parsed_response = json.loads(content)
          # Validate the response matches the schema
          if "question" in parsed_response and "options" in parsed_response and "answer" in parsed_response:
              return json.dumps(parsed_response, indent=4)
          else:
              raise ValueError("Generated question does not match the required schema.")

      except (json.JSONDecodeError, ValueError) as e:
          print(f"Error processing response: {e}")
          print(f"Raw response: {content}")
          return json.dumps({"error": "Failed to generate a valid question."}, indent=4)

def run_generate_questions(previous_questions: list, num_questions: int, course_name: str, topic: str):
    llm_engine = LLMEngine()

 
    

    # Generate questions
    result = generate_questions(llm_engine, course_name, topic, previous_questions, num_questions)
    print(result)
    return result


# previous_questions = previous_questions = [
#     {
#         "question": "What is Newton's First Law?",
#         "options": {
#             "A": "Every object will remain at rest or in uniform motion unless acted upon by an external force.",
#             "B": "Force equals mass times acceleration.",
#             "C": "For every action, there is an equal and opposite reaction.",
#             "D": "Energy cannot be created or destroyed.",
#         },
#         "answer": "A",
#     },
#     {
#         "question": "What is Newton's Second Law?",
#         "options": {
#             "A": "Every object will remain at rest or in uniform motion unless acted upon by an external force.",
#             "B": "Force equals mass times acceleration.",
#             "C": "For every action, there is an equal and opposite reaction.",
#             "D": "Energy cannot be created or destroyed.",
#         },
#         "answer": "B",
#     },
#     {
#         "question": "What is Newton's Third Law?",
#         "options": {
#             "A": "Every object will remain at rest or in uniform motion unless acted upon by an external force.",
#             "B": "Force equals mass times acceleration.",
#             "C": "For every action, there is an equal and opposite reaction.",
#             "D": "Energy cannot be created or destroyed.",
#         },
#         "answer": "C",
#     },
#     {
#         "question": "What is the formula for force?",
#         "options": {
#             "A": "Force equals mass times acceleration.",
#             "B": "Force equals mass divided by acceleration.",
#             "C": "Force equals acceleration divided by mass.",
#             "D": "Force equals velocity times mass.",
#         },
#         "answer": "A",
#     },
#     {
#         "question": "What is the unit of force?",
#         "options": {
#             "A": "Joule",
#             "B": "Newton",
#             "C": "Watt",
#             "D": "Pascal",
#         },
#         "answer": "B",
#     }
# ]
# course_name = "Physics 101"
# topic = "Newton's Laws of Motion"
# num_questions = 3
# run_generate_questions(previous_questions, num_questions, course_name, topic)
