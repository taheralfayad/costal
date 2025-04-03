import json
import os
import boto3


class LLMEngine:
    def __init__(self, model_id="us.meta.llama3-3-70b-instruct-v1:0", region="us-east-1"):
        """
        Initializes AWS Bedrock client for calling LLaMA-3 or another Bedrock-supported model.
        Uses environment variables for AWS credentials if available.
        """
        print("Initializing LLM Engine")
        if os.getenv("AWS_ACCESS_KEY") is None:
            self.boto3_client = boto3.client(
                "bedrock-runtime",
                region_name=os.getenv("AWS_REGION", region),
            )
        else:
            self.boto3_client = boto3.client(
                "bedrock-runtime",
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
                aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
                region_name=os.getenv("AWS_REGION"),
            )

        self.model_id = model_id
        self.conversation_history = []
        print("LLM Engine Initialized")

    def __format_prompt(self, system_prompt, user_message):
        """
        Formats the prompt with structured LLM markup for Bedrock.
        """
        formatted_prompt = f"""
            <|begin_of_text|><|start_header_id|>system<|end_header_id|>
                {system_prompt}
            <|eot_id|>
            <|start_header_id|>user<|end_header_id|>
                {user_message}
            <|eot_id|>
            <|start_header_id|>assistant<|end_header_id|>
        """
        return formatted_prompt

    def __parse_boto_response_stream(self, stream):
        """
        Parses the response stream from AWS Bedrock.
        """
        response_content = ""
        for event in stream:
            chunk = event.get("chunk")
            if chunk:
                message = json.loads(chunk.get("bytes").decode())
                response_content += message["generation"]

        return response_content.strip()

    def __call__(self, prompt: str, temperature: float = 0.7):
        """
        Calls the LLM model with a simple text prompt.
        """
        request_body = json.dumps(
            {
                "prompt": prompt,
                "temperature": temperature,
            }
        )
        
        try:
            response = self.boto3_client.invoke_model_with_response_stream(
                modelId=self.model_id,
                body=request_body,
                # accept='application/json', # Often optional, inferred
                # contentType='application/json' # Often optional, inferred
            )
            return self.__parse_boto_response_stream(response.get("body"))
        except Exception as e:
            # Check specifically for AccessDeniedException which indicates model access issues
            if "AccessDeniedException" in str(e):
                 print(f"Error: AccessDeniedException. Ensure you have requested access to model '{self.model_id}' in the AWS Bedrock console for region '{self.boto3_client.meta.region_name}'.")
            else:
                print(f"Error invoking Bedrock model {self.model_id}: {e}")
            # Consider raising the exception or returning a more structured error
            return f"Error: Could not get response from model. {e}"

    def extract_concepts(self, course_name: str, text: str, num_concepts: int = 3):
        """
        Extracts key concepts from a given text, ensuring structured JSON output.
        """
        system_prompt = f"You are an expert in {course_name}. Extract {num_concepts} key concepts from the provided text that are fundamental, clear, relevant, and suitable for challenging students."

        user_message = f"Extract {num_concepts} key concepts from the following text:\n\n{text}\n\nReturn a valid JSON array of strings."

        formatted_prompt = self.__format_prompt(system_prompt, user_message)

        response_text = self.__call__(formatted_prompt, temperature=0.0)

        try:
            parsed_response = json.loads(response_text)
            if isinstance(parsed_response, list):
                return parsed_response
            else:
                raise ValueError("Invalid JSON format received.")
        except json.JSONDecodeError:
            return {"error": "Failed to parse response as JSON."}

    def generate_questions(self, course_name: str, topic: str, previous_questions: list, num_questions: int = 1) -> str:
        """
        Chained 3-step generation:
        1. Extract concept
        2. Draft question with options (avoiding previous ones)
        3. Identify correct answer
        Returns: JSON with question, options, and correct answer letter.
        """

        try:
            system_prompt_1 = f"You are an expert in {course_name}."
            user_message_1 = (
                f"From the following topic or objective, extract the most relevant concept to base a multiple choice question on:\n\n"
                f"{topic}\n\n"
                "Return a single concept as a JSON string."
            )

            concept_prompt = self.__format_prompt(system_prompt_1, user_message_1)
            concept_response = self.__call__(concept_prompt, temperature=0.7)

            try:
                concept = json.loads(concept_response)
            except Exception:
                raise ValueError("Concept extraction failed or did not return a valid JSON string.", concept_response)

            prev_q_texts = "\n".join(
                [f"- {q['question']}" for q in previous_questions if 'question' in q]
            )
            
            avoidance_clause = f"Critically, the new question MUST be substantially different from these previous questions:\n{prev_q_texts}\n\n" if prev_q_texts else ""

            system_prompt_2 = f"You are a skilled educator in {course_name}."
            
            user_message_2 = ( f"Generate a **completely new and unique** multiple-choice question focusing on the core idea of this concept: \"{concept}\".\n\n"
            f"{avoidance_clause}"
            "Ensure the question tests understanding, not just recall. Phrase it differently using no markup language than any previous examples provided.\n"
            "The question must have exactly 4 plausible answer choices in no markup language labeled A, B, C, and D. You may use numbers and equations. One choice must be unambiguously correct.\n"
            "Return ONLY a valid JSON object with NO markup language with keys 'question' (string) and 'options' (object with keys 'A', 'B', 'C', 'D'), like:\n"
            "{\n" )


            question_prompt = self.__format_prompt(system_prompt_2, user_message_2)
            question_response = self.__call__(question_prompt, temperature=0.5)

            try:
                draft = json.loads(question_response)
                question_text = draft["question"]
                options = draft["options"]
            except Exception:
                raise ValueError("Question drafting failed or did not return valid JSON.")
            
            system_prompt_3 = (
                "You are an expert grader. You will be shown a multiple choice question with 4 options.\n"
                "Return only the correct letter (A, B, C, or D) in JSON format like:\n\"B\""
            )

            options_text = "\n".join([f"{key}: {val}" for key, val in options.items()])
            user_message_3 = f"{question_text}\n\nOptions:\n{options_text}"
            answer_prompt = self.__format_prompt(system_prompt_3, user_message_3)
            answer_response = self.__call__(answer_prompt, temperature=0.0)

            try:
                correct_letter = json.loads(answer_response)
                if correct_letter not in options:
                    raise ValueError
            except Exception:
                raise ValueError("Answer identification failed or returned invalid option.")

            return json.dumps({
                "question": question_text,
                "options": options,
                "answer": correct_letter
            }, indent=4)

        except Exception as e:
            return json.dumps({"error": str(e)}, indent=4)



    def generate_chat_response(self, user_message: str) -> str:
        """
        Generates a chat response while maintaining conversation history.
        """
        system_instruction = (
            "You are a helpful assistant capable of answering a wide range of questions. "
            "Provide concise and accurate responses, guiding the user without directly giving away answers."
        )

        self.conversation_history.append({"role": "user", "content": user_message})

        messages = [{"role": "system", "content": system_instruction}] + self.conversation_history

        formatted_prompt = self.__format_prompt(system_instruction, user_message)

        response_text = self.__call__(formatted_prompt, temperature=0.7)

        self.conversation_history.append({"role": "assistant", "content": response_text})

        return response_text

    def generate_hint(self, question: str, question_answer_choices) -> str:
        """
        Generates a hint for a given question without giving away the answer.
        """

        answer_texts = []
        if isinstance(question_answer_choices, list):
            for choice in question_answer_choices:
                if isinstance(choice, dict) and 'answer' in choice:
                    answer_texts.append(str(choice['answer']))
                elif hasattr(choice, 'answer'):
                     answer_texts.append(str(choice.answer))

        if not answer_texts:
            print("Warning: No valid answer texts found in question_answer_choices for hint generation.")
            pass


        system_instruction = (
            "You are an assistant in a sensitive learning environment. "
            "Your responsibility is to generate a concise hint for the given question, "
            "helping the user without revealing the correct answer."
            "Return without using LaTeX or any other markup language."
            
        )

        formatted_prompt = self.__format_prompt(system_instruction, question)

        hint = self.__call__(formatted_prompt, temperature=0.7)

        max_rewrites = 3 
        rewrite_count = 0
        while any(answer_text in hint for answer_text in answer_texts) and rewrite_count < max_rewrites:
            print(f"Hint contains an answer, rewriting (Attempt {rewrite_count + 1})...")
            hint = self.__rewrite_hint(hint, answer_texts_to_avoid=answer_texts)
            rewrite_count += 1
        
        return hint
    
    def __rewrite_hint(self, hint: str, answer_texts_to_avoid: list) -> str:
        """
        Rewrites the hint to avoid revealing specific answer texts.
        """
        avoid_list_str = "\n - ".join(answer_texts_to_avoid)
        system_instruction = (
            f"Rewrite the following hint so that it does NOT contain or strongly imply any of these specific answer phrases:\n"
            f" - {avoid_list_str}\n\n"
            "The rewritten hint must still be relevant to the original question context implied by the original hint, helpful, and concise (1-2 sentences).\n"
            "Use HTML markup.."
        )
        user_message = f"Original Hint: {hint}"


        formatted_prompt = self.__format_prompt(system_instruction, user_message)
        rewritten_hint = self.__call__(formatted_prompt, temperature=0.6) 
        return rewritten_hint

