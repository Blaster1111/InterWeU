from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import re
import os
import requests
import json
from dotenv import load_dotenv
load_dotenv(override=True)

# OpenRouter API Configuration
API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL = os.getenv("OPENROUTER_MODEL")

if not API_KEY or not MODEL:
    raise EnvironmentError("OPENROUTER_API_KEY or OPENROUTER_MODEL is not set. Check your .env file.")


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

def clean_text_for_prep(text):
    text = text.replace("\n", " ").replace("\r", " ")
    text = re.sub(r"[^a-zA-Z0-9\s.%]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.lower().strip()

Keywords = [
    "education", "summary", "accomplishments", "executive profile", "professional profile",
    "personal profile", "work background", "academic profile", "other activities",
    "qualifications", "experience", "interests", "skills", "achievements",
    "publications", "certifications", "workshops", "projects", "internships",
    "trainings", "hobbies", "overview", "objective", "position of responsibility",
    "jobs", "relevant coursework", "technical skills"
]

def extract_keywords(text):
    content = {}
    indices = []
    keys = []
    
    for key in Keywords:
        try:
            start_idx = text.index(key)
            indices.append(start_idx)
            keys.append(key)
        except ValueError:
            continue
    
    sorted_pairs = sorted(zip(indices, keys))
    indices, keys = zip(*sorted_pairs) if sorted_pairs else ([], [])
    
    for i in range(len(keys)):
        start_idx = indices[i] + len(keys[i])
        end_idx = indices[i + 1] if i + 1 < len(keys) else len(text)
        content[keys[i]] = text[start_idx:end_idx].strip()
    
    return content

def query_openrouter(prompt):
    if not API_KEY or not MODEL:
        return "API key or model not set in environment variables." 
    """Sends request to OpenRouter API using DeepSeek model"""
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    data = json.dumps({
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}]
    })
    
    response = requests.post(url, headers=headers, data=data)
    
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return f"Error: {response.status_code} - {response.text}"

@app.route('/parse_resume', methods=['POST'])
def parse_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided"}), 400

    file = request.files['resume']
    job_desc = request.form.get('job_description')

    text = pdf_to_text(file)
    cleaned_text = clean_text_for_prep(text)

    # Extract information
    parsed_content = {
        'E-mail': get_email_addresses(text),
        'phone number': get_phone_numbers(text)
    }
    
    # Extract sections
    content = extract_keywords(cleaned_text)
    parsed_content.update(content)

    resume_imp_content = " ".join(content.values())
    
    # Prepare prompt
    prompt = f"Candidate’s Skills: {resume_imp_content}. Job Description: {job_desc}. Critically analyze the alignment between the candidate's skills and the job description, evaluating minute details thoroughly based on deeper domain relevance and critical assessment, while ensuring a fair and unbiased ranking. Provide the response in this format without markdown language: ATS Score: [estimated number out of 100]\nStrengths:\n- [List key strengths]\nImprovements and Required Skills:\n- [List missing or weak skills]"

    response_text = query_openrouter(prompt)

    # Extract ATS score, strengths, and improvements
    ats_score_match = re.search(r'[#]*\s*ats\s*score\s*[:\-]?\s*(\d{1,3})', response_text, re.IGNORECASE)

    strengths_match = re.search(r'Strengths\s*([\s\S]*?)Improvements and Required Skills', response_text, re.IGNORECASE)

    ats_score = ats_score_match.group(1) if ats_score_match else None
    strengths = strengths_match.group(1).strip() if strengths_match else None

    return jsonify({
        "parsed_content": parsed_content,
        "deepseek_response": {
            "ats_score": ats_score,
            "strengths": strengths,
            "full_response": response_text
        }
    })

if __name__ == '__main__':
        app.run(debug=True)
