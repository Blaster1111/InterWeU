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

Keywords = ["education", "relevant coursework", "skills", "experience", "projects"]

def extract_keywords(text):
    content = {}
    for key in Keywords:
        try:
            content[key] = text[text.index(key) + len(key):]
        except ValueError:
            content[key] = ""
    return content

@app.route('/parse_resume', methods=['POST'])
def parse_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided"}), 400

    file = request.files['resume']
    print(file)
    job_desc = request.form.get('job_description')

    text = pdf_to_text(file)
    
    # Parse content
    parsed_content = {}
    parsed_content['E-mail'] = get_email_addresses(text)
    parsed_content['phone number'] = get_phone_numbers(text)
    # parsed_content['Name'] = extract_name(text)
    
    # Extract sections based on keywords
    content = extract_keywords(text.lower())
    
    parsed_content['education'] = content['education']
    parsed_content['relevant coursework'] = content['relevant coursework']
    parsed_content['skills'] = content['skills']
    parsed_content['experience'] = content['experience']
    parsed_content['projects'] = content['projects']
    
    # Combine key resume content for Gemini API
    resume_imp_content = " ".join([
        parsed_content['skills'], parsed_content['experience'], parsed_content['projects']
    ])

    # Prepare prompt for Gemini API
    prompt = f"These are the skills parsed from a resume: {resume_imp_content} and this is the job description: {job_desc}. Give response in the following pattern: ATS score: [estimated number out of 100]\n Strenghts:\nImprovements and skills required: "
    chat_session = genai.GenerativeModel(model_name="gemini-1.5-flash", generation_config={"max_output_tokens": 1000})
    response = chat_session.start_chat().send_message(prompt)

    ats_score_match = re.search(r'ATS score:\s*(\d+)', response.text)
    strengths_match = re.search(r'Strengths:\s*([\s\S]*?)(?=Improvements and skills required:)', response.text)

    ats_score = ats_score_match.group(1) if ats_score_match else None
    strengths = strengths_match.group(1).strip() if strengths_match else None


    # Response to the frontend
    return jsonify({
        "parsed_content": parsed_content,
        "gemini_response": {
            "ats_score": ats_score,
            "strengths": strengths,
            "full_response": response.text
        }
    })

if __name__ == '__main__':
    app.run(debug=True)