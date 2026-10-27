-- Seed Organizations (~40 organizations across IT, Tech, Fintech, Government, Platforms, Conglomerates)
-- Note: Every seeded row has needs_team_review = true by default per verification policy.
-- Run: UPDATE organizations SET needs_team_review = false WHERE ... after team review.

insert into public.organizations (name, aliases, kind, official_domains, careers_url, scholarships_url, is_government, is_demo, needs_team_review)
values
  -- Demo Organization (used when DEMO_MODE=true)
  ('Example Technologies Pvt. Ltd.', '{"Example Tech", "Example"}', 'company', '{"example.com"}', 'https://example.com/careers', null, false, true, true),

  -- Tech & IT Services
  ('Tata Consultancy Services', '{"TCS", "Tata Consultancy"}', 'company', '{"tcs.com"}', 'https://www.tcs.com/careers', null, false, false, true),
  ('Infosys Limited', '{"Infosys"}', 'company', '{"infosys.com"}', 'https://www.infosys.com/careers.html', null, false, false, true),
  ('Wipro Limited', '{"Wipro"}', 'company', '{"wipro.com"}', 'https://careers.wipro.com', null, false, false, true),
  ('HCLTech', '{"HCL Technologies", "HCL"}', 'company', '{"hcltech.com"}', 'https://www.hcltech.com/careers', null, false, false, true),
  ('Accenture', '{"Accenture India"}', 'company', '{"accenture.com"}', 'https://www.accenture.com/in-en/careers', null, false, false, true),
  ('Cognizant Technology Solutions', '{"Cognizant", "CTS"}', 'company', '{"cognizant.com"}', 'https://careers.cognizant.com', null, false, false, true),
  ('Google', '{"Google India", "Alphabet"}', 'company', '{"google.com", "google.co.in", "alphabet.com"}', 'https://careers.google.com', 'https://buildyourfuture.withgoogle.com/scholarships', false, false, true),
  ('Microsoft', '{"Microsoft India"}', 'company', '{"microsoft.com"}', 'https://careers.microsoft.com', null, false, false, true),
  ('Amazon', '{"Amazon India", "Amazon Web Services", "AWS"}', 'company', '{"amazon.com", "amazon.in", "amazon.jobs"}', 'https://www.amazon.jobs', null, false, false, true),
  ('IBM', '{"International Business Machines", "IBM India"}', 'company', '{"ibm.com"}', 'https://www.ibm.com/careers', null, false, false, true),
  ('Oracle', '{"Oracle India"}', 'company', '{"oracle.com"}', 'https://www.oracle.com/corporate/careers/', null, false, false, true),
  ('Intel', '{"Intel Corporation", "Intel India"}', 'company', '{"intel.com"}', 'https://www.intel.com/jobs', null, false, false, true),
  ('Cisco Systems', '{"Cisco", "Cisco India"}', 'company', '{"cisco.com"}', 'https://www.cisco.com/c/en/us/about/careers.html', null, false, false, true),
  ('Capgemini', '{"Capgemini India"}', 'company', '{"capgemini.com"}', 'https://www.capgemini.com/in-en/careers/', null, false, false, true),
  ('LTIMindtree', '{"LTI", "Mindtree"}', 'company', '{"ltimindtree.com"}', 'https://www.ltimindtree.com/careers/', null, false, false, true),
  ('Tech Mahindra', '{"TechM"}', 'company', '{"techmahindra.com"}', 'https://careers.techmahindra.com', null, false, false, true),

  -- E-commerce & Fintech
  ('Flipkart', '{"Flipkart Internet"}', 'company', '{"flipkart.com"}', 'https://www.flipkartcareers.com', null, false, false, true),
  ('Paytm', '{"One97 Communications", "Paytm Payments"}', 'company', '{"paytm.com"}', 'https://paytm.com/careers', null, false, false, true),
  ('Razorpay', '{"Razorpay Software"}', 'company', '{"razorpay.com"}', 'https://razorpay.com/jobs/', null, false, false, true),
  ('Swiggy', '{"Bundl Technologies"}', 'company', '{"swiggy.com"}', 'https://careers.swiggy.com', null, false, false, true),
  ('Zomato', '{"Zomato Limited", "Blinkit"}', 'company', '{"zomato.com"}', 'https://www.zomato.com/careers', null, false, false, true),
  ('PhonePe', '{"PhonePe Private Limited"}', 'company', '{"phonepe.com"}', 'https://www.phonepe.com/careers/', null, false, false, true),
  ('CRED', '{"Dreamplug Technologies"}', 'company', '{"cred.club"}', 'https://cred.club/careers', null, false, false, true),

  -- Education, Student & Recruitment Platforms
  ('Internshala', '{"Scholiverse Educare"}', 'event_platform', '{"internshala.com"}', 'https://internshala.com', null, false, false, true),
  ('Unstop', '{"Dare2Compete", "D2C"}', 'event_platform', '{"unstop.com"}', 'https://unstop.com', null, false, false, true),
  ('NPTEL', '{"National Programme on Technology Enhanced Learning"}', 'university', '{"nptel.ac.in"}', 'https://nptel.ac.in', null, false, false, true),
  ('Coursera', '{"Coursera Inc"}', 'event_platform', '{"coursera.org"}', 'https://about.coursera.org/careers', null, false, false, true),
  ('HackerRank', '{"InterviewStreet"}', 'event_platform', '{"hackerrank.com"}', 'https://www.hackerrank.com/careers', null, false, false, true),
  ('GeeksforGeeks', '{"GFG"}', 'event_platform', '{"geeksforgeeks.org"}', 'https://www.geeksforgeeks.org/careers/', null, false, false, true),
  ('LinkedIn', '{"LinkedIn Corporation"}', 'event_platform', '{"linkedin.com"}', 'https://careers.linkedin.com', null, false, false, true),

  -- Government & Public Sector Bodies
  ('All India Council for Technical Education', '{"AICTE"}', 'government', '{"aicte-india.org"}', 'https://internship.aicte-india.org', null, true, false, true),
  ('University Grants Commission', '{"UGC"}', 'government', '{"ugc.gov.in", "ugc.ac.in"}', 'https://www.ugc.gov.in', 'https://scholarships.gov.in', true, false, true),
  ('National Scholarship Portal', '{"NSP"}', 'government', '{"scholarships.gov.in"}', null, 'https://scholarships.gov.in', true, false, true),
  ('Indian Space Research Organisation', '{"ISRO"}', 'government', '{"isro.gov.in"}', 'https://www.isro.gov.in/Careers.html', null, true, false, true),
  ('Defence Research and Development Organisation', '{"DRDO"}', 'government', '{"drdo.gov.in"}', 'https://www.drdo.gov.in/careers', null, true, false, true),
  ('Ministry of Corporate Affairs', '{"MCA"}', 'government', '{"mca.gov.in"}', 'https://www.mca.gov.in', null, true, false, true),
  ('Ministry of Electronics and Information Technology', '{"MeitY"}', 'government', '{"meity.gov.in"}', 'https://www.meity.gov.in', null, true, false, true),
  ('NITI Aayog', '{"National Institution for Transforming India"}', 'government', '{"niti.gov.in"}', 'https://niti.gov.in/internship', null, true, false, true),

  -- Conglomerates
  ('Reliance Industries Limited', '{"RIL", "Jio", "Reliance"}', 'company', '{"ril.com", "jio.com"}', 'https://www.ril.com/careers', null, false, false, true),
  ('Tata Group', '{"Tata Sons", "Tata"}', 'company', '{"tata.com"}', 'https://www.tata.com/careers', null, false, false, true),
  ('Adani Group', '{"Adani Enterprises", "Adani"}', 'company', '{"adani.com"}', 'https://www.adani.com/careers', null, false, false, true),
  ('Mahindra & Mahindra', '{"Mahindra Group", "Mahindra"}', 'company', '{"mahindra.com"}', 'https://www.mahindra.com/careers', null, false, false, true),
  ('Larsen & Toubro', '{"L&T"}', 'company', '{"larsentoubro.com"}', 'https://www.larsentoubro.com/corporate/careers/', null, false, false, true)
on conflict (lower(name)) do nothing;
