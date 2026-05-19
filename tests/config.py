import random
import string

# tests/config.py
# WHAT: Centralized variables and utility helpers for automated E2E tests.
# WHY: Consolidating base endpoints and parameter generators ensures tests are resilient
#      and do not suffer from stale configs or hardcoded static resource conflicts.

API_URL = "http://localhost:5000"
APP_URL = "http://localhost:3000"

def generate_random_email():
    """Generates a cryptographically randomized test email address."""
    # We randomize the email prefix to bypass unique-email constraints on registration
    prefix = "".join(random.choices(string.ascii_lowercase + string.digits, k=10))
    return f"test_{prefix}@autobazaar.com"

def generate_random_string(length=12):
    """Generates a randomized alphanumeric string of specified length."""
    return "".join(random.choices(string.ascii_letters + string.digits, k=length))
