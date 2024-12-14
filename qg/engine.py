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

    def generate_questions(self, course_name: str, text: str) -> json:
        key_concepts = self.extract_concepts(course_name, text)
        system_instruction = (
            f"You are an expert in {course_name}. You will be provided with key concepts and some text from the course content and your task is to create challenging multiple-choice questions based on those concepts, suitable for assessing student understanding.  Always provide 4 options (A, B, C, D) in the following JSON Schema.",
        )

        questions = {}
        for concept in key_concepts:
            print(f"Generating qs for concept: {concept}")
            prompt = f"Course Content: {text}\n\nKey Concept: {concept}"

            response = self.llm.create_chat_completion(
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object", "schema": self.question_schema},
                temperature=0.0,
                max_tokens=200,
            )

            # Process the response
            content = response["choices"][0]["message"]["content"]

            try:
                parsed_response = json.loads(content)
                questions[concept] = parsed_response

            except json.JSONDecodeError as e:
                print(f"Error decoding JSON: {e}")
                print(f"Raw response: {content}")

        return json.dumps(questions, indent=4)

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


# course_name = "Earth Science"
# text = """The water cycle, also known as the hydrologic cycle, describes the continuous movement of water within the Earth and atmosphere. It is a complex system that includes many different processes. Liquid water evaporates into water vapor, condenses to form clouds, and precipitates back to earth in the form of rain and snow."""
# service = LLMEngine()
# service.generate_questions(course_name, text)
