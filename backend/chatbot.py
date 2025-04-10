import streamlit as st
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load API key
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_GEN_AI_API_KEY"))

# Initialize Gemini model
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction="""
    You are a highly experienced coding expert with over 40 years of hands-on experience 
    in software development, web development, data structures, and algorithms. 
    You know all modern and legacy programming languages (Python, C++, Java, Rust, Haskell, etc.).
    Explain concepts in simple yet expert detail with code examples where helpful.
    Always answer like a wise mentor who loves to teach and help others grow in coding.
    """
)

# Session state for chat history
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

st.set_page_config(page_title="Expert AI Chatbot", layout="wide")
st.title("🤖 GG Coding Mentor Chatbot")

# Input box for user
user_input = st.chat_input("Ask me anything about coding, web dev, DSA, or any programming language...")

if user_input:
    # Display user message
    st.session_state.chat_history.append({"role": "user", "text": user_input})

    # Send to Gemini
    convo = model.start_chat(history=[
        {"role": msg["role"], "parts": [msg["text"]]} for msg in st.session_state.chat_history
    ])
    response = convo.send_message(user_input)

    # Save assistant's reply
    st.session_state.chat_history.append({"role": "model", "text": response.text})

# Show chat history
for msg in st.session_state.chat_history:
    with st.chat_message("🧑‍💻" if msg["role"] == "user" else "🤖"):
        st.markdown(msg["text"])
