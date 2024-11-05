from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import re
import spacy
from spacy.matcher import Matcher
import google.generativeai as genai
import os
from dotenv import load_dotenv
import re

load_dotenv()

# Configure Google Gemini API
genai.configure(api_key=os.getenv("MyAPIKEY"))

app = Flask(__name__)

# Helper functions
def pdf_to_text(file):
    text = ""
    document = fitz.open(stream=file.read(), filetype="pdf")
    for page_num in range(document.page_count):
        page = document.load_page(page_num)
        text += page.get_text()
    return text

def get_email_addresses(string):
    r = re.compile(r'[\w\.-]+@[\w\.-]+')
    return r.findall(string)

def get_phone_numbers(string):
    r = re.compile(r'(\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4})')
    phone_numbers = r.findall(string)
    return [re.sub(r'\D', '', num) for num in phone_numbers if len(re.sub(r'\D', '', num)) in [8, 10]]


def clean_text(text):
    # Normalize text: Lowercasing and removing unnecessary symbols
    text = text.lower()  # Convert to lowercase
    text = re.sub(r'[*:\n]', ' ', text)  # Replace asterisks, colons, and newlines with spaces
    text = re.sub(r'[^\w\s]', '', text)  # Remove all non-word characters except spaces
    text = re.sub(r'\s+', ' ', text)  # Replace multiple spaces with a single space
    text = text.strip()  # Remove leading and trailing whitespace
    return text

import re

def clean_text_for_prep(text):
    text = text.replace("\n", " ").replace("\r", " ")
    text = re.sub(r"[^a-zA-Z0-9\s.%]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.lower().strip()

# nlp = spacy.load('en_core_web_sm')
# matcher = Matcher(nlp.vocab)

# def extract_name(text):
#     nlp_text = nlp(text)
#     pattern = [{'POS': 'PROPN'}, {'POS': 'PROPN'}]
#     matcher.add('NAME', [pattern])
#     matches = matcher(nlp_text)
#     for match_id, start, end in matches:
#         span = nlp_text[start:end]
#         return span.text

Keywords = ["education",
            "summary",
            "accomplishments",
            "executive profile",
            "professional profile",
            "personal profile",
            "work background",
            "academic profile",
            "other activities",
            "qualifications",
            "experience",
            "interests",
            "skills",
            "achievements",
            "publications",
            "publication",
            "certifications",
            "workshops",
            "projects",
            "internships",
            "trainings",
            "hobbies",
            "overview",
            "objective",
            "position of responsibility",
            "jobs",
            "relevant coursework",
            "experience",
            "projects",
            "technical skills",
           ]

def extract_keywords(text):
    content = {}
    indices = []
    keys = []
    
    # Collect the start indices and the corresponding keys
    for key in Keywords:
        try:
            start_idx = text.index(key)
            indices.append(start_idx)
            keys.append(key)
        except ValueError:
            continue
    
    # Sort the indices and keys together
    sorted_pairs = sorted(zip(indices, keys))
    indices, keys = zip(*sorted_pairs)
    
    # Extract the sections between the sorted indices
    for i in range(len(keys)):
        start_idx = indices[i] + len(keys[i])
        end_idx = indices[i + 1] if i + 1 < len(keys) else len(text)
        # Trim whitespace and avoid overlap
        section_content = text[start_idx:end_idx].strip()
        if keys[i] in content:
            content[keys[i]] += " " + section_content
        else:
            content[keys[i]] = section_content
    
    return content


@app.route('/parse_resume', methods=['POST'])
def parse_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided"}), 400

    file = request.files['resume']
    print(file)
    job_desc = request.form.get('job_description')

    text = pdf_to_text(file)
    cleaned_text = clean_text_for_prep(text)
    # Parse content
    parsed_content = {}
    parsed_content['E-mail'] = get_email_addresses(text)
    parsed_content['phone number'] = get_phone_numbers(text)
    # parsed_content['Name'] = extract_name(text)
    
    # Extract sections based on keywords
    content = extract_keywords(cleaned_text)
    
    # Extract basic information
    parsed_content = {
        'E-mail': get_email_addresses(text),
        'phone number': get_phone_numbers(text)
    }
    
    parsed_content.update(content)
    parsed_content['skills'] += parsed_content['technical skills']
    # Combine key resume content for Gemini API
    resume_imp_content = " ".join([
        parsed_content['skills'], parsed_content['experience'], parsed_content['projects']
    ])

    del parsed_content['technical skills']

    # Prepare prompt for Gemini API
    prompt = f"These are the skills parsed from a resume: {resume_imp_content} and this is the job description: {job_desc}. Give response in the following pattern: ATS score: [estimated number out of 100]\n Strenghts:\nImprovements and skills required: "
    chat_session = genai.GenerativeModel(model_name="gemini-1.5-flash", generation_config={"max_output_tokens": 1000})
    response = chat_session.start_chat().send_message(prompt)

    cleaned_response = clean_text(response.text)

    # Adjusted regex patterns
    ats_score_match = re.search(r'\bats\s*score\s*[:\-]?\s*(\d{2,3})\b', cleaned_response)
    strengths_match = re.search(r'strengths\s*([\s\S]*?)improvements and skills required', cleaned_response)

    ats_score = ats_score_match.group(1) if ats_score_match else None
    strengths = strengths_match.group(1).strip() if strengths_match else None


    # Response to the frontend
    return jsonify({
        "parsed_content": parsed_content,
        "gemini_response": {
            "ats_score": ats_score,
            "strengths": strengths,
            "full_response": cleaned_response
        }
    })

if __name__ == '__main__':
    app.run(debug=True)