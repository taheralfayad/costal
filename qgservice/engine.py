import json
import os
import boto3
import time


class LLMEngine:
    def __init__(
        self, model_id="us.meta.llama3-3-70b-instruct-v1:0", region="us-east-1"
    ):
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
                print(
                    f"Error: AccessDeniedException. "
                    f"Ensure you have requested access to model '{self.model_id}' "
                    "in the AWS Bedrock "
                    f"console for region '{self.boto3_client.meta.region_name}'."
                )
            else:
                print(f"Error invoking Bedrock model {self.model_id}: {e}")
            # Consider raising the exception or returning a more structured error
            return f"Error: Could not get response from model. {e}"

    def extract_concepts(self, course_name: str, text: str, num_concepts: int = 3):
        """
        Extracts key concepts from a given text, ensuring structured JSON output.
        """
        system_prompt = (
            f"You are an expert in {course_name}. "
            f"Extract {num_concepts} key concepts from the provided text "
            "that are fundamental, clear, relevant, and "
            "suitable for challenging students."
        )

        user_message = (
            f"Extract {num_concepts} key concepts "
            f"from the following text:\n\n{text}\n\n "
            "Return a valid JSON array of strings."
        )

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

    def __call_messages_with_params(self, model_id: str, params: dict) -> str:
        """
        Calls the Claude LLM model through Bedrock using the provided parameters.
        Returns the parsed response content.
        """
        request_body = json.dumps(params)
        try:
            response = self.boto3_client.invoke_model(
                modelId=model_id, body=request_body
            )

            response_body = json.loads(response["body"].read().decode("utf-8"))

            if "tool_use" in response_body:
                tool_use = response_body.get("tool_use", {})
                tool_name = tool_use.get("name")
                tool_input = tool_use.get("input", {})

                if tool_name == "submit_correct_answer" and "answer" in tool_input:
                    return json.dumps({"answer": tool_input["answer"]})

            if "content" in response_body and isinstance(
                response_body["content"], list
            ):
                for content_item in response_body["content"]:
                    if (
                        isinstance(content_item, dict)
                        and content_item.get("type") == "text"
                    ):
                        return content_item.get("text", "")

            return json.dumps(response_body)

        except Exception as e:
            print(f"Detailed error: {str(e)}")
            raise ValueError(f"Claude API call failed: {str(e)}") from e

    def generate_questions(
        self,
        course_name: str,
        topic: str,
        previous_questions: list,
        num_questions: int = 1,
    ) -> str:
        """
        Generate multiple-choice questions using Claude tool-call.
        Claude returns the entire structured question as a tool result.
        """
        claude_model_id = "us.anthropic.claude-3-7-sonnet-20250219-v1:0"
        results = []

        for _ in range(num_questions):
            try:
                concept = topic.strip()
                if not concept:
                    raise ValueError(
                        "The topic is empty and cannot be used as a concept."
                    )

                prev_q_texts = "\n".join(
                    [f"- {q['text']}" for q in previous_questions if "text" in q]
                )
                # filter prev_q_texts to only include field 'text' from previous_questions

                avoidance_clause = (
                    "Ensure this question is completely "
                    + "unique and not similar to the following:\n"
                    + prev_q_texts
                    + "\n\n"
                    if prev_q_texts
                    else ""
                )

                system_message = (
                    f"You are an expert {course_name} educator creating multiple-choice "
                    f"questions for K-12 and beyond. When creating questions, "
                    f"be especially careful about: "
                    f"1. Ensuring numerical answers are precise and accurate "
                    f"2. Checking that scientific principles are correctly applied "
                    f"3. Verifying that the question indeed is solvable "
                    f"4. IMPORTANT: Never use duplicate questions. "
                    f"5. When writing equations or mathematical expressions, "
                    f"use HTML markup to ensure clarity and correctness "
                    f"6. Follow the styling, conventions, and"
                    f" types of questions that are provided to you "
                    f"7. For the question you generate,"
                    f" analyze and explain your reasoning "
                    f"in 2 sentences. "
                    f"8. DO NOT OVER-EXPLAIN YOUR REASONING. "
                    f"Keep it concise and to the point. "
                    f"9.GENERATE ONLY THE QUESTION TEXT, "
                    f"NOT THE ANSWERS OR OPTIONS. "
                )
                user_message = (
                    f'Topic: "{concept}"\n\n'
                    f"{avoidance_clause}"
                    "Create a unique, high-quality multiple-choice question.\n\n"
                    "IMPORTANT: Follow this 2-step process:\n"
                    "1. Create your question and ensure it has a solution.\n"
                    "2. Verify your reasoning with calculations or logical steps."
                    "Return your response using the `submit_question` tool with:\n"
                    "- Question text\n"
                    "- Succinct reasoning NO LONGER THAN 5 sentences for why this question."
                )
                call_params = {
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 2000,
                    "temperature": 0.5,
                    "system": system_message,
                    "messages": [
                        {
                            "role": "user",
                            "content": [{"type": "text", "text": user_message}],
                        }
                    ],
                    "tools": [
                        {
                            "name": "submit_question",
                            "description": "Submit a multiple-choice question with reasoning.",
                            "input_schema": {
                                "type": "object",
                                "properties": {
                                    "question": {
                                        "type": "string",
                                        "description": "The question text.",
                                    },
                                    "reasoning": {
                                        "type": "string",
                                        "description": "Explain why this question "
                                        + "is a solvable and appropriate.",
                                    },
                                },
                                "required": ["question", "reasoning"],
                            },
                        }
                    ],
                    "tool_choice": {"type": "tool", "name": "submit_question"},
                }
                time.sleep(2)
                response_json_str = self.__call_messages_with_params(
                    claude_model_id, call_params
                )

                print(f"FULL CLAUDE RESPONSE: {response_json_str}")

                try:
                    response_data = json.loads(response_json_str)

                    print(f"RESPONSE STRUCTURE: {json.dumps(response_data, indent=2)}")

                    tool_result = None

                    if "content" in response_data:
                        for content_block in response_data["content"]:
                            if content_block.get("type") == "tool_use":
                                tool_input = content_block.get("input")
                                if (
                                    tool_input
                                    and content_block.get("name") == "submit_question"
                                ):
                                    tool_result = tool_input
                                    break

                    elif "tool_outputs" in response_data:
                        for tool_output in response_data["tool_outputs"]:
                            if tool_output.get("tool_name") == "submit_question":
                                tool_result = tool_output.get("content")
                                break

                    if tool_result is None:
                        tool_result = response_data

                    question_text = None
                    options = None
                    correct_letter = None
                    reasoning = None

                    if "question" in tool_result:
                        question_text = tool_result.get("question")
                        reasoning = tool_result.get("reasoning")

                    if not question_text:
                        raise ValueError(
                            "Claude response is missing required fields or has invalid values."
                        )

                    gen_options_message = (
                        f"CRITICAL TASK: Generate multiple-choice options for the "
                        f"following question about '{concept}'.\n\n"
                        f"Question: {question_text}\n\n"
                        f"Follow these steps VERY STRICTLY:\n"
                        f"1. **Solve the Question:** First, perform the necessary "
                        f"calculations or logical steps to find the single, precise "
                        f"correct answer value. Show your step-by-step work internally.\n"
                        f"2. **Determine Correct Value:** Clearly identify the final "
                        f"calculated correct answer value.\n"
                        f"3. **Generate Options:** Create exactly four distinct options "
                        f"(A, B, C, D). One of these options MUST exactly match the "
                        f"correct answer value you determined in Step 2. The other three "
                        f"options must be plausible but incorrect distractors. Ensure "
                        f"distractors are derived from common errors or related concepts, "
                        f"but are definitively wrong.\n"
                        f"4. **Assign Correct Letter:** Identify which letter (A, B, C, "
                        f"or D) corresponds to the correct answer value.\n"
                        f"5. **Provide Solution Reasoning:** Explain the step-by-step "
                        f"process you used to arrive at the correct answer value "
                        f"(max 100 words). Focus on the calculation/logic, not just "
                        f"stating the answer is correct.\n\n"
                        f"IMPORTANT CONSTRAINTS:\n"
                        f"- Do NOT default to 'closest answer' or 'best fit'. The correct "
                        f"option must match your calculated value precisely.\n"
                        f"- Generate the options ONLY AFTER you have calculated the "
                        f"correct answer value.\n"
                        f"- Ensure all numerical options are precise if the question "
                        f"requires it.\n\n"
                        f"Use the 'create_options' tool to submit your result."
                    )

                    gen_options_params = {
                        "anthropic_version": "bedrock-2023-05-31",
                        "max_tokens": 1500,
                        "temperature": 0.15,
                        "messages": [
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": gen_options_message,
                                    }  # noqa: E501
                                ],
                            }
                        ],
                        "tools": [
                            {
                                "name": "create_options",
                                "description": "Create 4 unique options (A, B, C, D) for a multiple-choice question after solving it, provide the correct answer letter, the calculated value, and the reasoning for the solution.",  # noqa: E501
                                "input_schema": {
                                    "type": "object",
                                    "properties": {
                                        "calculated_answer": {
                                            "type": "string",
                                            "description": "The exact calculated correct answer value derived from solving the question step-by-step. This MUST be determined BEFORE generating options A,B,C,D.",  # noqa: E501
                                        },
                                        "options": {
                                            "type": "object",
                                            "description": "A dictionary containing the four options, keyed by A, B, C, D. One option must exactly match the 'calculated_answer'.",  # noqa: E501
                                            "properties": {
                                                "A": {"type": "string"},
                                                "B": {"type": "string"},
                                                "C": {"type": "string"},
                                                "D": {"type": "string"},
                                            },
                                            "required": ["A", "B", "C", "D"],
                                        },
                                        "answer": {
                                            "type": "string",
                                            "enum": ["A", "B", "C", "D"],
                                            "description": "The letter (A, B, C, or D) corresponding to the option that exactly matches the 'calculated_answer'.",  # noqa: E501
                                        },
                                        "reasoning": {
                                            "type": "string",
                                            "description": "Concise explanation of the step-by-step calculation or logical process used to arrive at the 'calculated_answer' (max 100 words).",  # noqa: E501
                                        },
                                    },
                                    "required": [
                                        "calculated_answer",
                                        "options",
                                        "answer",
                                        "reasoning",
                                    ],
                                },
                            }
                        ],
                        "tool_choice": {"type": "tool", "name": "create_options"},
                    }

                    options_response_json_str = self.__call_messages_with_params(
                        claude_model_id, gen_options_params
                    )
                    print(
                        f"DEBUG: Full Claude Response (Options Gen): {options_response_json_str}"
                    )

                    options_tool_result = None
                    options = None
                    correct_letter = None
                    solution_reasoning = None
                    calculated_answer_value = None

                    try:
                        options_response_data = json.loads(options_response_json_str)
                        if "error" in options_response_data:
                            raise ValueError(
                                f"API Error during options generation: {options_response_data['error']}"  # noqa: E501
                            )

                        print(
                            f"DEBUG: Parsed Response Structure (Options Gen): {json.dumps(options_response_data, indent=2)}"  # noqa: E501
                        )

                        if "content" in options_response_data:
                            for content_block in options_response_data.get(
                                "content", []
                            ):
                                if (
                                    content_block.get("type") == "tool_use"
                                    and content_block.get("name") == "create_options"
                                ):
                                    options_tool_result = content_block.get("input")
                                    print(
                                        f"DEBUG: Found Tool Result (Options Gen) in 'content': {json.dumps(options_tool_result, indent=2)}"  # noqa: E501
                                    )
                                    break

                        if options_tool_result is None:
                            if (
                                isinstance(options_response_data, dict)
                                and "options" in options_response_data
                            ):
                                options_tool_result = options_response_data
                            else:
                                raise ValueError(
                                    "Failed to extract options. "
                                    "'create_options' tool result not found."
                                )

                        calculated_answer_value = options_tool_result.get(
                            "calculated_answer"
                        )
                        options = options_tool_result.get("options")
                        correct_letter = options_tool_result.get("answer")
                        solution_reasoning = options_tool_result.get("reasoning")

                        # --- Validation for Options Generation ---
                        if (
                            not options
                            or not correct_letter
                            or not solution_reasoning
                            or calculated_answer_value is None
                        ):
                            print(
                                "VALIDATION ERROR (Options Gen): "
                                "Missing required fields."
                            )
                            print(f"  calculated_answer: {calculated_answer_value}")
                            print(f"  options: {options}")
                            print(f"  correct_letter: {correct_letter}")
                            print(f"  solution_reasoning: {solution_reasoning}")
                            raise ValueError(
                                "Claude response from 'create_options' is missing required fields."
                            )

                        if not isinstance(options, dict):
                            print(
                                f"VALIDATION ERROR (Options Gen): Options must "
                                f"be a dictionary. Got: {type(options)}"
                            )
                            raise ValueError("Options must be a dictionary.")

                        if set(options.keys()) != {"A", "B", "C", "D"}:
                            print(
                                f"VALIDATION ERROR (Options Gen): "
                                f"Invalid options keys: {set(options.keys())}"
                            )
                            raise ValueError(
                                "Options must include exactly A, B, C, and D keys."
                            )

                        if correct_letter not in ["A", "B", "C", "D"]:
                            print(
                                f"VALIDATION ERROR (Options Gen): "
                                f"Invalid 'answer' value: {correct_letter}"
                            )
                            raise ValueError(
                                "Correct answer letter must be A, B, C, or D."
                            )
                        print(f"DEBUG: Generated Options: {options}")
                        print(f"DEBUG: Proposed Correct Letter: {correct_letter}")
                        print(
                            f"DEBUG: Calculated Value by LLM: {calculated_answer_value}"
                        )
                        print(f"DEBUG: Solution Reasoning by LLM: {solution_reasoning}")

                    except json.JSONDecodeError as json_err:
                        print(f"JSON DECODE ERROR (Options Gen): {str(json_err)}")
                        print(
                            f"RAW RESPONSE (Options Gen): {options_response_json_str[:200]}..."
                        )
                        raise ValueError(
                            f"Claude returned invalid JSON (Options Gen): "
                            f"{options_response_json_str[:200]}..."
                        ) from json_err
                    except Exception as parse_error:
                        print(f"PARSE ERROR (Options Gen): {str(parse_error)}")
                        raise ValueError(
                            "Failed to parse structured options response (Options Gen)."
                        ) from parse_error

                    verification_message = (
                        f"Review this multiple-choice question on {concept}:\n\n"
                        f"Question: {question_text}\n"
                        f"A: {options['A']}\n"
                        f"B: {options['B']}\n"
                        f"C: {options['C']}\n"
                        f"D: {options['D']}\n\n"
                        f"Proposed correct answer: {correct_letter}\n"
                        f"Determine which option (A, B, C, or D) is the correct answer. "
                        f"Analyze each option carefully and "
                        f"explain your reasoning in about 5 sentences."
                    )

                    verification_params = {
                        "anthropic_version": "bedrock-2023-05-31",
                        "max_tokens": 1500,
                        "temperature": 0.05,
                        "system": f"You are an expert {course_name} educator "
                        f"verifying the correct answer to a multiple-choice question.",
                        "messages": [
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": verification_message}
                                ],
                            }
                        ],
                    }
                    time.sleep(2)
                    verification_response = self.__call_messages_with_params(
                        claude_model_id, verification_params
                    )
                    print(f"VERIFICATION RESPONSE: {verification_response}")
                    verified_answer = None
                    for letter in ["A", "B", "C", "D"]:
                        if (
                            f"correct answer is {letter}" in verification_response
                            or f"Answer: {letter}" in verification_response
                        ):
                            verified_answer = letter
                            break

                    if verified_answer and verified_answer != correct_letter:
                        print(
                            f"WARNING: Answer verification mismatch! Original: "
                            f"{correct_letter}, Verified: {verified_answer}"
                        )
                        print(f"Original reasoning: {reasoning}")
                        print(f"Verification response: {verification_response}")

                        correct_letter = verified_answer

                    extraction_params = {
                        "anthropic_version": "bedrock-2023-05-31",
                        "max_tokens": 300,
                        "temperature": 0.0,
                        "system": "You are an expert at parsing reasoning outputs.",
                        "messages": [
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": f'From the following reasoning, extract the correct answer letter (A, B, C, or D): "{verification_response}"',  # noqa: E501
                                    }
                                ],
                            }
                        ],
                    }
                    # wait 2 seconds
                    time.sleep(2)
                    extraction_response = self.__call_messages_with_params(
                        claude_model_id, extraction_params
                    )
                    print(f"EXTRACTION RESPONSE: {extraction_response}")

                    extracted_answer = None
                    for letter in ["A", "B", "C", "D"]:
                        if (
                            f"correct answer is {letter}" in extraction_response
                            or f"Answer: {letter}" in extraction_response
                            or letter in extraction_response
                        ):
                            extracted_answer = letter
                            break
                    if extracted_answer:
                        correct_letter = extracted_answer

                    result = {
                        "question": question_text.strip(),
                        "options": options,
                        "answer": correct_letter,
                    }

                    results.append(result)

                except json.JSONDecodeError as json_err:
                    print(f"JSON DECODE ERROR: {str(json_err)}")
                    print(f"RAW RESPONSE: {response_json_str[:200]}...")
                    raise ValueError(
                        f"Claude returned invalid JSON: {response_json_str[:200]}..."
                    )
                except Exception as parse_error:
                    print(f"PARSE ERROR: {str(parse_error)}")
                    raise ValueError(
                        "Failed to parse structured question response."
                    ) from parse_error

            except Exception as e:
                print(f"GENERAL ERROR: {str(e)}")
                return json.dumps({"error": str(e)}, indent=4)

        return (
            json.dumps(results[0], indent=4)
            if num_questions == 1
            else json.dumps(results, indent=4)
        )

    def generate_chat_response(self, user_message: str) -> str:
        """
        Generates a chat response while maintaining conversation history.
        """
        system_instruction = (
            "You are a helpful assistant capable of answering a wide range of questions. "
            "Provide concise and accurate responses, guiding the user without directly giving "
            "away answers."
        )

        self.conversation_history.append({"role": "user", "content": user_message})

        formatted_prompt = self.__format_prompt(system_instruction, user_message)

        response_text = self.__call__(formatted_prompt, temperature=0.7)

        self.conversation_history.append(
            {"role": "assistant", "content": response_text}
        )

        return response_text

    def generate_hint(self, question: str, question_answer_choices) -> str:
        """
        Generates a hint for a given question without giving away the answer.
        """

        answer_texts = []
        if isinstance(question_answer_choices, list):
            for choice in question_answer_choices:
                if isinstance(choice, dict) and "answer" in choice:
                    answer_texts.append(str(choice["answer"]))
                elif hasattr(choice, "answer"):
                    answer_texts.append(str(choice.answer))

        if not answer_texts:
            print(
                "Warning: No valid answer texts found in question_answer_choice "
                "for hint generation."
            )
            pass

        system_instruction = (
            "You are an assistant in a sensitive learning environment. "
            "Your responsibility is to generate a concise hint for the given question, "
            "helping the user without revealing the correct answer."
            "Return without using LaTeX or any other markup language."
            "Be consice and ask yourself, is this too revealing? Only allude to concepts "
            "that may help. Not the answer."
            "Do not include the answer or anything that may resemble an answer in your hint."
        )

        formatted_prompt = self.__format_prompt(system_instruction, question)

        hint = self.__call__(formatted_prompt, temperature=0.7)

        max_rewrites = 3
        rewrite_count = 0
        while (
            any(answer_text in hint for answer_text in answer_texts)
            and rewrite_count < max_rewrites
        ):
            print(
                f"Hint contains an answer, rewriting (Attempt {rewrite_count + 1})..."
            )
            hint = self.__rewrite_hint(hint, answer_texts_to_avoid=answer_texts)
            rewrite_count += 1

        return hint

    def __rewrite_hint(self, hint: str, answer_texts_to_avoid: list) -> str:
        """
        Rewrites the hint to avoid revealing specific answer texts.
        """
        avoid_list_str = "\n - ".join(answer_texts_to_avoid)
        system_instruction = (
            f"Rewrite the following hint so that it does NOT contain or strongly "
            "imply any of these specific answer phrases:\n"
            f" - {avoid_list_str}\n\n"
            "The rewritten hint must still be relevant to the original question context "
            "implied by the original hint, helpful, and concise (1-2 sentences).\n"
            "Use HTML markup.."
        )
        user_message = f"Original Hint: {hint}"

        formatted_prompt = self.__format_prompt(system_instruction, user_message)
        rewritten_hint = self.__call__(formatted_prompt, temperature=0.6)
        return rewritten_hint
