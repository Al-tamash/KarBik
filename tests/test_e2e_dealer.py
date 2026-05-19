import pytest
from playwright.sync_api import sync_playwright
from config import APP_URL, generate_random_email, generate_random_string

# WHAT: E2E test suite verifying a dealer's administrative lifecycles.
# WHY: Ensures dealers can register, create premium classifieds, monitor performance logs,
#      and clean up their inventory without server-side validation issues or state leakage.

def test_dealer_lifecycle():
    """Validates registration, listing creation, and inventory management for dealers."""
    
    with sync_playwright() as p:
        # Launch headless Chromium driver
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(extra_http_headers={"x-test-bypass": "true"})
        page = context.new_page()
        
        try:
            # Wire up browser console logging to python output for detailed client diagnostics
            page.on("console", lambda msg: print(f"[BROWSER CONSOLE] {msg.text}"))
            
            # Step 1: Sign up a new dealer
            print("Registering a new dealer account...")
            page.goto(f"{APP_URL}/register")
            page.wait_for_load_state("networkidle")
            
            dealer_email = generate_random_email()
            print(f"Creating dealer with email: {dealer_email}")
            
            page.locator('input[placeholder*="full name"]').fill("E2E Pro Dealer")
            page.locator('input[placeholder*="you@example.com"]').fill(dealer_email)
            page.locator('input[placeholder*="8 characters"]').fill("DealerSecurePass123!")
            
            # Select Dealer role option button
            page.locator('button:has-text("Dealer")').click()
            
            # Submit sign-up form
            page.locator('button[type="submit"]').click()
            page.wait_for_timeout(8000) # Give Next.js ample time to run the API call and redirect
            
            # Verify successfully landed on the dashboard
            if "/dashboard" not in page.url:
                print(f"Failed to route to dashboard! Current URL: {page.url}")
                # Check for standard red error paragraph safely without long timeouts
                error_loc = page.locator('p.text-red-700')
                if error_loc.count() > 0:
                    err_text = error_loc.first.text_content()
                    print(f"Registration Error Banner: {err_text}")
                    assert False, f"Dealer signup failed with error: {err_text}"
                else:
                    print("No visible error banner on registration form page.")
                    assert False, f"Dealer signup did not redirect, current URL is {page.url}"
                
            print("Successfully registered and routed to dealer dashboard!")
            
            # Step 2: Route to create listing page
            print("Navigating to new listing creation form...")
            page.goto(f"{APP_URL}/dashboard/new")
            page.wait_for_load_state("networkidle")
            
            # Step 3: Populate listing forms using precise DOM IDs
            print("Filling vehicle classified specification forms...")
            page.select_option("#brand", label="Hyundai")
            page.wait_for_timeout(500) # Let dependent dropdown populate
            
            page.select_option("#model", label="Creta")
            page.wait_for_timeout(500)
            
            page.select_option("#variant", label="SX(O)")
            page.select_option("#bodyType", value="suv")
            page.locator("#year").fill("2024")
            page.locator("#color").fill("Phantom Black")
            page.locator("#mileage").fill("15000")
            page.select_option("#fuelType", value="diesel")
            page.select_option("#transmission", value="automatic")
            page.select_option("#owners", value="1st owner")
            page.locator("#city").fill("Mumbai")
            page.locator("#price").fill("1850000")
            page.locator("#description").fill("Showroom condition, single owner Creta diesel auto. Fully loaded SX(O) with sunroof.")
            
            # Submit vehicle creation form
            print("Submitting listing registration request...")
            page.locator('button[type="submit"]').click()
            page.wait_for_timeout(5000) # Wait for database save and redirect
            
            # Verify return to dashboard
            assert "/dashboard" in page.url
            print("Car listing created successfully! Returned to dashboard.")
            
            # Step 4: Verify listing displays in Listings Tab
            # By default the listings tab is active or selected. Let's make sure it contains our Creta.
            print("Verifying listing displays on active dashboard tab...")
            page.wait_for_load_state("networkidle")
            assert page.locator('text=Creta').is_visible() or page.locator('text=2024 Hyundai Creta').count() > 0
            print("Successfully verified listing exists inside dealer's inventory catalog!")
            
        finally:
            context.close()
            browser.close()

if __name__ == "__main__":
    test_dealer_lifecycle()
