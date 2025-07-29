from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import re
import whois
import ssl
import socket
import tldextract
import datetime
from urllib.parse import urlparse
import os
import google.generativeai as gen_ai
from dotenv import load_dotenv

class PhishingRequest(BaseModel):
    user_input: str

class PhishingResponse(BaseModel):
    is_phishing: bool = False
    reasons: list = []
    safe: bool = False
    message: str = ""


# Load .env from backend/api directory or project root
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "tools", ".env"))
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    gen_ai.configure(api_key=GOOGLE_API_KEY)

router = APIRouter()

# Function to check SSL certificate
def check_ssl_certificate(domain):
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.socket(), server_hostname=domain) as s:
            s.settimeout(5)
            s.connect((domain, 443))
            return bool(s.getpeercert())
    except Exception:
        return False

# Function to detect phishing using heuristics
def heuristic_phishing_detection(url):
    parsed_url = urlparse(url)
    domain = parsed_url.netloc.lower().replace("www.", "")
    extracted = tldextract.extract(url)
    subdomain = extracted.subdomain
    domain_name = extracted.domain
    suffix = extracted.suffix
    path = parsed_url.path.lower()
    query = parsed_url.query.lower()
    risk_score = 0
    reasons = []
    # 1. URL Length
    if len(url) > 75:
        risk_score += 1
        reasons.append("URL is too long")
    # 2. Special Characters
    if "@" in url:
        risk_score += 2
        reasons.append("URL contains '@' symbol")
    if "-" in domain:
        risk_score += 1
        reasons.append("Domain contains hyphen ('-')")
    if "_" in url:
        risk_score += 1
        reasons.append("URL contains underscore ('_')")
    # 3. Subdomain Depth
    subdomain_depth = len(subdomain.split(".")) if subdomain else 0
    if subdomain_depth > 2:
        risk_score += 2
        reasons.append("Too many subdomains")
    # 4. IP Address Instead of Domain
    if re.match(r"^(?:\d{1,3}\.){3}\d{1,3}$", domain):
        risk_score += 3
        reasons.append("Uses an IP address instead of a domain name")
    # 5. WHOIS Domain Age & Existence
    try:
        domain_info = whois.whois(domain)
        if not domain_info.domain_name:
            risk_score += 3
            reasons.append("No WHOIS record found for domain")
        elif domain_info.creation_date:
            creation_date = domain_info.creation_date[0] if isinstance(domain_info.creation_date, list) else domain_info.creation_date
            if isinstance(creation_date, datetime.datetime):
                age_days = (datetime.datetime.now() - creation_date).days
                if age_days < 180:
                    risk_score += 3
                    reasons.append("Domain is newly registered (< 6 months)")
    except Exception:
        risk_score += 2
        reasons.append("WHOIS lookup failed")
    # 6. SSL Certificate Check
    if not check_ssl_certificate(domain):
        risk_score += 2
        reasons.append("No SSL Certificate (HTTP instead of HTTPS)")
    # 7. Suspicious Keywords in Domain
    phishing_keywords = ["login", "verify", "update", "secure", "account", "bank", "paypal", "security", "ebay"]
    for keyword in phishing_keywords:
        if keyword in domain:
            risk_score += 2
            reasons.append(f"Suspicious keyword found in domain: '{keyword}'")
    # 8. HTTPS Check
    if parsed_url.scheme == "http":
        risk_score += 2
        reasons.append("URL uses HTTP instead of HTTPS")
    # 9. Homograph Attack Check (basic)
    try:
        domain_ascii = domain.encode('ascii')
    except UnicodeEncodeError:
        risk_score += 2
        reasons.append("Domain contains suspicious Unicode characters (possible homograph attack)")
    # 10. Suspicious TLDs
    bad_tlds = ["tk", "ml", "ga", "cf", "gq"]
    if suffix in bad_tlds:
        risk_score += 2
        reasons.append(f"Domain uses suspicious TLD: .{suffix}")
    # 11. Multiple Dots in Domain (excluding subdomains)
    if domain.count('.') > 3:
        risk_score += 1
        reasons.append("Domain contains many dots")
    # 12. Shortened URLs
    shorteners = ["bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd", "buff.ly", "adf.ly"]
    if any(short in url for short in shorteners):
        risk_score += 3
        reasons.append("URL uses a known URL shortener")
    # 13. Excessive Digits in Domain
    if sum(c.isdigit() for c in domain) > 5:
        risk_score += 2
        reasons.append("Domain contains excessive digits")
    # 14. Suspicious Path/Query Keywords
    path_keywords = ["confirm", "validate", "reset", "password", "login", "update", "verify"]
    for keyword in path_keywords:
        if keyword in path or keyword in query:
            risk_score += 2
            reasons.append(f"Suspicious keyword found in URL path or query: '{keyword}'")
    threshold = 5
    is_phishing = risk_score >= threshold
    return is_phishing, reasons

@router.post("/phishing-check", response_model=PhishingResponse)
def phishing_check(request: PhishingRequest):
    user_input = request.user_input
    url_pattern = r"\b(?:https?://|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z0-9]{2,}\b"
    urls = re.findall(url_pattern, user_input)
    if urls:
        for url in urls:
            is_phish, reasons = heuristic_phishing_detection(url)
            if is_phish:
                return PhishingResponse(is_phishing=True, reasons=reasons, message=f"\U0001F6A8 Warning! The URL `{url}` appears suspicious.\n\nDetected Issues:\n- " + "\n- ".join(reasons))
            else:
                return PhishingResponse(safe=True, message=f"✅ The URL `{url}` seems safe, but always verify before proceeding.")
    # fallback: chatbot-like response
    chatbot_responses = {
        "hello": "Hello! How can I assist you today?",
        "hi": "Hi there! What can I help you with?",
        "how are you": "I'm just a bot, but I'm here to help!",
        "what is phishing": "Phishing is a cyber attack where attackers impersonate legitimate entities to steal sensitive information.",
        "how to avoid phishing": "To avoid phishing, never click on suspicious links, verify sender identities, and use multi-factor authentication.",
        "tell me about ssl": "SSL (Secure Sockets Layer) is a security protocol that encrypts data between a browser and a server, making transactions secure.",
        "bye": "Goodbye! Stay safe online!",
    }
    response = chatbot_responses.get(user_input.lower(), "Let me check...")
    # If not a known phrase, try Gemini
    if response == "Let me check..." and GOOGLE_API_KEY:
        try:
            model = gen_ai.GenerativeModel('gemini-2.0-flash')
            chat_session = model.start_chat()
            gemini_response = chat_session.send_message(user_input)
            response = gemini_response.text if hasattr(gemini_response, "text") else "I couldn't generate a response."
        except Exception as e:
            response = f"An error occurred: {e}"
    return PhishingResponse(message=response)
