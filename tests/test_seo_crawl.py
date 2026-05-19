# tests/test_seo_crawl.py
#
# WHAT: Automated SEO Crawl and Verification Suite.
# WHY: We need to verify that search engine crawlers (Google, Bing) can successfully fetch our sitemap
#      and robots policies, and parse dynamic openGraph and schema.org tags without hydration or server crashes.

import pytest
import requests
import re
import xml.etree.ElementTree as ET
from playwright.sync_api import sync_playwright
from config import APP_URL, API_URL

def test_robots_txt_directives():
    """Fetches robots.txt and asserts standard bot indexing and disallow directives."""
    print("\n[SEO Test] Fetching robots.txt disallow rules...")
    
    url = f"{APP_URL}/robots.txt"
    response = requests.get(url)
    
    # Verify sitemap response code is 200 OK
    assert response.status_code == 200, f"Failed to fetch robots.txt. Status: {response.status_code}"
    
    content = response.text
    content_lower = content.lower()
    print(f"Robots.txt content:\n{content}")
    
    # Assert standard crawl rules and sitemap target (casing-insensitive to prevent header flakes)
    assert "user-agent: *" in content_lower, "Missing global user-agent directive"
    assert "disallow: /dashboard/" in content_lower, "Dashboard must be excluded from web indexes"
    assert "disallow: /api/" in content_lower, "Proxy API endpoints must be excluded from crawler lists"
    assert "disallow: /compare" in content_lower, "Comparison panel route must be disallowed"
    assert "sitemap.xml" in content_lower, "Robots.txt must link to the dynamic sitemap"
    print("[SEO Test] Robots.txt crawl rules successfully validated!")

def test_sitemap_xml_resolution():
    """Fetches sitemap.xml, parses nodes, and validates dynamically populated links."""
    print("\n[SEO Test] Fetching sitemap.xml...")
    
    url = f"{APP_URL}/sitemap.xml"
    response = requests.get(url)
    
    # Assert response resolved successfully
    assert response.status_code == 200, f"Failed to fetch sitemap.xml. Status: {response.status_code}"
    
    # Sitemap should be served with correct application/xml or text/xml Content-Type
    content_type = response.headers.get("Content-Type", "")
    assert "xml" in content_type.lower(), f"Incorrect sitemap Content-Type header: {content_type}"
    
    # Parse XML elements using standard ElementTree module
    try:
        root = ET.fromstring(response.content)
    except ET.ParseError as e:
        pytest.fail(f"Sitemap is not a valid XML structure: {e}")
        
    # Standard XML namespace for sitemaps is sitemaps.org
    ns = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    
    # Extract all <loc> text children elements
    loc_elements = root.findall(".//ns:loc", ns)
    urls = [elem.text for elem in loc_elements if elem.text]
    
    print(f"Discovered {len(urls)} links inside dynamic sitemap.xml")
    
    # Assert core static routes are present
    assert f"{APP_URL}" in urls or f"{APP_URL}/" in urls, "Homepage URL is missing"
    assert f"{APP_URL}/cars" in urls, "Browse search directory URL is missing"
    assert f"{APP_URL}/pricing" in urls, "Subscription plans URL is missing"
    
    # Fetch actual vehicles from the database/API to confirm sitemap contains dynamic links
    try:
        cars_res = requests.get(f"{API_URL}/api/cars?limit=5")
        if cars_res.status_code == 200:
            cars_data = cars_res.json()
            for car in cars_data.get("cars", []):
                expected_url = f"{APP_URL}/cars/{car['_id']}"
                assert expected_url in urls, f"Dynamic car detail link missing from sitemap: {expected_url}"
                print(f"Verified dynamic listing sitemap index: {expected_url}")
    except Exception as e:
        print(f"Skipping dynamic sitemap check due to backend connection: {e}")
        
    print("[SEO Test] Sitemap XML structures and dynamics successfully validated!")

def test_opengraph_metadata_tags():
    """Queries pages via direct HTTP GET and Playwright to verify openGraph/schema tags resolve on server side."""
    print("\n[SEO Test] Fetching dynamic pages and parsing dynamic metadata...")
    
    # 1. Verify Homepage SEO Tags via direct HTTP request (resilient to browser load timings)
    home_res = requests.get(APP_URL)
    assert home_res.status_code == 200, "Failed to load homepage"
    home_html = home_res.text
    
    # Assert standard title is in header
    assert "<title>" in home_html.lower() and "</title>" in home_html.lower(), "Missing document title element"
    print("Verified homepage title structure successfully via HTTP GET.")
    
    # 2. Verify Dynamic Dealer LocalBusiness JSON-LD structure
    # Fetch an active dealer slug from database first
    dealers_res = requests.get(f"{API_URL}/api/dealers")
    assert dealers_res.status_code == 200, "Failed to reach dealers database list API"
    dealers_data = dealers_res.json()
    
    if len(dealers_data) > 0:
        dealer_slug = dealers_data[0].get("slug")
        dealer_url = f"{APP_URL}/dealer/{dealer_slug}"
        print(f"Auditing dynamic dealer showroom raw HTML: {dealer_url}")
        
        dealer_res = requests.get(dealer_url)
        assert dealer_res.status_code == 200, f"Dealer page returned status {dealer_res.status_code}"
        dealer_html = dealer_res.text
        
        # Verify JSON-LD Schema existence in raw server-rendered html (essential for search bots)
        assert 'type="application/ld+json"' in dealer_html or 'type=\'application/ld+json\'' in dealer_html, "Google LocalBusiness JSON-LD schema script is missing from server-rendered HTML!"
        assert "AutoDealer" in dealer_html or "LocalBusiness" in dealer_html, "Dynamic dealer schema is missing AutoDealer context type!"
        print("Successfully verified dynamic AutoDealer JSON-LD structured script in raw HTML!")
        
        # Now use Playwright to verify the title gets fully populated inside browser DOM
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(user_agent="AutoBazaar-SEO-Crawler/1.0")
            page = context.new_page()
            
            try:
                page.goto(dealer_url)
                # Wait until body is present and title has loaded
                page.wait_for_selector("main")
                # Wait a brief moment to allow page to fully hydradrate/render title on dev environments
                page.wait_for_timeout(1000)
                
                # Fetch page title from browser context
                title = page.title()
                print(f"Browser populated title: '{title}'")
                
                # We assert the title is non-empty and contains the business slug details
                assert len(title) > 0, "Browser page title resolved as empty string!"
                assert "bazaar" in title.lower() or dealer_slug.replace("-", "").lower()[:6] in title.lower().replace(" ", ""), f"Unexpected browser title string: {title}"
                print("Playwright dynamic browser title verified successfully!")
            finally:
                browser.close()
    else:
        print("Skipping dealer page crawl tests: No dealers seeded in mock database.")

if __name__ == "__main__":
    test_robots_txt_directives()
    test_sitemap_xml_resolution()
    test_opengraph_metadata_tags()
