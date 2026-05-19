import subprocess
import sys
import time

# WHAT: Unified Master Test Runner module.
# WHY: Executes all security, integration, and E2E buyer/dealer test cases in sequence,
#      presenting an aggregated summary report for rapid developer validation.

def run_test_module(name, command):
    """Executes a specific test suite module command and captures output."""
    print(f"\n========================================================")
    print(f" RUNNING TEST SUITE: {name}")
    print(f"========================================================")
    
    start_time = time.time()
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    duration = time.time() - start_time
    
    print(result.stdout)
    if result.stderr:
        print(f"Error Output:\n{result.stderr}")
        
    status = "SUCCESS" if result.returncode == 0 else "FAILED"
    print(f"Finished in {duration:.2f} seconds | Status: {status}")
    return result.returncode == 0, duration

def main():
    """Sequentially triggers all integration and E2E testing flows."""
    print("========================================================")
    print("      AutoBazaar Unified E2E & Integration Suite")
    print("========================================================")
    print("NOTE: Ensure local Next.js client is running on port 3000")
    print("      and Express backend server is running on port 5000.")
    print("========================================================\n")
    
    # Define test modules to run
    suites = {
        "E2E - Buyer Vehicle Search & Lead Inquiry": ["pytest", "tests/test_e2e_buyer.py"],
        "E2E - Dealer Lifecycle & Classifieds CRUD": ["pytest", "tests/test_e2e_dealer.py"],
        "Integration - Security Headers & Rate Limits": ["pytest", "tests/test_integration_sec.py"],
        "SEO Crawl - Sitemap, Robots, & OpenGraph Metadata": ["pytest", "tests/test_seo_crawl.py"]
    }
    
    results = {}
    
    for name, command in suites.items():
        success, duration = run_test_module(name, command)
        results[name] = {"success": success, "duration": duration}
        
    print("\n========================================================")
    print("                 FINAL REPORT SUMMARY")
    print("========================================================")
    all_passed = True
    for name, data in results.items():
        status = "[PASS] PASSED" if data["success"] else "[FAIL] FAILED"
        if not data["success"]:
            all_passed = False
        print(f"- {name:<50} : {status} (in {data['duration']:.2f}s)")
        
    print("========================================================")
    if all_passed:
        print("[SUCCESS] ALL TEST SUITES SUCCESSFULLY COMPLETED!")
        sys.exit(0)
    else:
        print("[WARNING] SOME TEST MODULES ENCOUNTERED FAILURES. PLEASE INSPECT LOGS ABOVE.")
        sys.exit(1)

if __name__ == "__main__":
    main()
