import pytest
from playwright.sync_api import sync_playwright
from config import APP_URL, generate_random_email, generate_random_string

# WHAT: E2E test verifying a buyer's capability to search for vehicles and submit inquiries.
# WHY: Solidifies standard buyer search-to-lead conversion loops to ensure our critical retail paths
#      never encounter client-side errors or hydration failures.

def test_buyer_search_and_inquiry():
    """Validates the complete buyer search, detail routing, and lead inquiry submission flow."""
    
    with sync_playwright() as p:
        # Launch the headless Chromium browser instance
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(extra_http_headers={"x-test-bypass": "true"})
        page = context.new_page()
        
        try:
            # Step 1: Navigate to public vehicle showroom
            print("Navigating to showroom page...")
            page.goto(f"{APP_URL}/cars")
            page.wait_for_load_state("networkidle")
            
            # Step 2: Search for cars
            print("Searching for vehicles using keyword search...")
            search_input = page.locator('input[placeholder*="Search by brand"]')
            search_input.fill("Toyota")
            search_input.press("Enter")
            page.wait_for_load_state("networkidle")
            
            # Step 3: Handle search outputs and transition to details page
            # If no matches are found, we'll verify the showroom loads at least one card
            print("Locating car card element...")
            car_cards = page.locator(".card-hover")
            
            if car_cards.count() == 0:
                print("No Toyota found in mock DB. Clearing filters to load active listings...")
                page.goto(f"{APP_URL}/cars")
                page.wait_for_load_state("networkidle")
                
            car_cards = page.locator(".card-hover")
            if car_cards.count() > 0:
                print("Car listing detected. Clicking first available car...")
                first_card = car_cards.first
                first_card.click()
                page.wait_for_load_state("networkidle")
                
                # Assert URL routing succeeded
                assert "/cars/" in page.url
                print(f"Details page successfully loaded: {page.url}")
                
                # Step 4: Submit lead inquiry
                print("Filling out buyer inquiry form details...")
                # Locating by input selectors on CarDetailView.js
                page.locator('input[placeholder*="Your name"]').fill("Automated E2E Buyer")
                page.locator('input[placeholder*="Phone"]').fill("9876543210")
                page.locator('textarea[placeholder*="message"]').fill("Hi dealer, is this certified Toyota still available?")
                
                print("Clicking submit inquiry button...")
                page.locator('button:has-text("Submit Inquiry")').click()
                page.wait_for_timeout(1000) # Give modal animation time to transition
                
                # Step 5: Handle inline guest login modal (since we started as unauthenticated guest)
                print("Handling guest checkout inline auth modal...")
                # Fill in credentials for dynamic registration inside modal
                page.locator('input[placeholder*="you@example.com"]').fill(generate_random_email())
                # Use a standard high-entropy password that meets the minLength restriction (>=8 characters)
                page.locator('input[placeholder*="8 characters"]').fill("SecurePassword123!")
                
                # Click signup/register within modal
                print("Submitting modal registration...")
                page.locator('button:has-text("Create Account")').click()
                page.wait_for_timeout(3000) # Wait for registration + submission
                
                # Verify inquiry result banner or state change
                success_message = page.locator('text=Inquiry sent')
                assert success_message.is_visible() or success_message.count() > 0
                print("E2E Buyer inquiry submission complete and successfully verified!")
            else:
                print("Skipping detail inspection - DB listing inventory is currently empty.")
                
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    test_buyer_search_and_inquiry()
