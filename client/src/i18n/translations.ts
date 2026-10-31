export type Language = "en" | "hi" | "kn";

export interface Translations {
  nav: {
    brand_sub: string;
    how_it_works: string;
    coverage_facts: string;
    verification_guide: string;
    helpline_nav: string;
    sign_in: string;
    check_offer: string;
    my_history: string;
    settings: string;
    sign_out: string;
    log_in: string;
    sign_up: string;
  };
  hero: {
    eyebrow: string;
    title_p1: string;
    title_accent: string;
    subtitle: string;
    cta_check: string;
    cta_sample: string;
    feature1_num: string;
    feature1_title: string;
    feature1_desc: string;
    feature2_num: string;
    feature2_title: string;
    feature2_desc: string;
    feature3_num: string;
    feature3_title: string;
    feature3_desc: string;
    portals_eyebrow: string;
    portals_title: string;
    portal1_name: string;
    portal2_name: string;
    portal3_name: string;
    portals_footer: string;
  };
  matrix: {
    col1_eyebrow: string;
    col1_title: string;
    col1_desc: string;
    col2_eyebrow: string;
    col2_title: string;
    col2_desc: string;
    col3_eyebrow: string;
    col3_title: string;
    col3_desc: string;
    col4_eyebrow: string;
    col4_title: string;
    col4_desc: string;
  };
  submission: {
    title: string;
    subtitle: string;
    tab_paste: string;
    tab_upload: string;
    action_paste: string;
    pasted_notice: string;
    clipboard_err: string;
    placeholder: string;
    characters: string;
    min_chars: string;
    scenario_active: string;
    scenario_eyebrow: string;
    submit_btn: string;
    analyzing_btn: string;
    instant_check: string;
    err_min_chars: string;
    err_generic: string;
    scenarios: {
      techcorp_name: string;
      scholarship_name: string;
      genuine_name: string;
    };
  };
  audit: {
    eyebrow: string;
    title: string;
    subtitle: string;
    phase_prefix: string;
    step1_num: string;
    step1_title: string;
    step1_summary: string;
    step1_details: string;
    step2_num: string;
    step2_title: string;
    step2_summary: string;
    step2_details: string;
    step3_num: string;
    step3_title: string;
    step3_summary: string;
    step3_details: string;
  };
  guidelines: {
    guide_eyebrow: string;
    guide_title: string;
    guide_sub: string;
    guide_p1_prefix: string;
    guide_p1_strong: string;
    guide_p2: string;
    helpline_eyebrow: string;
    helpline_title: string;
    helpline_desc: string;
    call_btn: string;
  };
  footer: {
    tagline: string;
    helpline_label: string;
    edu_title: string;
    edu_desc: string;
    edu_link1: string;
    edu_link2: string;
    privacy_title: string;
    privacy_desc: string;
    privacy_link: string;
    copyright: string;
    feedback: string;
    select_lang: string;
    lang_en: string;
    lang_hi: string;
    lang_kn: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      brand_sub: "OFFER VERIFICATION",
      how_it_works: "How it works",
      coverage_facts: "Coverage & Facts",
      verification_guide: "Verification Guide",
      helpline_nav: "Helpline 1930",
      sign_in: "Sign in",
      check_offer: "Check an offer",
      my_history: "My History",
      settings: "Settings",
      sign_out: "Sign out",
      log_in: "Log in",
      sign_up: "Sign up",
    },
    hero: {
      eyebrow: "INDEPENDENT VERIFICATION FOR STUDENTS",
      title_p1: "Know it's real",
      title_accent: "before you reply.",
      subtitle:
        "A free tool that helps Indian students check job, internship and training offers before sharing money or documents.",
      cta_check: "Check an offer",
      cta_sample: "See a sample report",
      feature1_num: "01",
      feature1_title: "Don't pay to start",
      feature1_desc: "Real internships never ask for fees, deposits, or kit charges.",
      feature2_num: "02",
      feature2_title: "Check the sender",
      feature2_desc: "Verify free email IDs, lookalike links, and official corporate CINs.",
      feature3_num: "03",
      feature3_title: "Verify, then reply",
      feature3_desc: "Follow 8 verified student safety rules before accepting terms.",
      portals_eyebrow: "VERIFIED CHANNELS",
      portals_title: "Official portals are always 100% free.",
      portal1_name: "PM Internship Scheme (Ministry of Corporate Affairs)",
      portal2_name: "National Career Service (Ministry of Labour)",
      portal3_name: "National Scholarship Portal (NSP)",
      portals_footer: "Reference: Official Government Portals • Zero Application Fees",
    },
    matrix: {
      col1_eyebrow: "OFFER TYPES COVERED",
      col1_title: "Comprehensive Coverage",
      col1_desc: "Placements, internships, freelance",
      col2_eyebrow: "REGIONAL LANGUAGES",
      col2_title: "English & 12 Indian Scripts",
      col2_desc: "English, Hindi, Tamil, Telugu, Marathi, Bengali, Kannada, etc.",
      col3_eyebrow: "OPEN ACCESS",
      col3_title: "100% Free & Independent",
      col3_desc: "No fees, zero data tracking",
      col4_eyebrow: "OFFICIAL REPORTING",
      col4_title: "National Helpline 1930",
      col4_desc: "Direct referral to Cyber Crime Portal",
    },
    submission: {
      title: "Submit offer details for verification.",
      subtitle:
        "Analyzed locally in your browser. Personal contact details and documents are never sent to or stored on any server.",
      tab_paste: "Paste offer text",
      tab_upload: "Upload screenshot",
      action_paste: "Paste from clipboard",
      pasted_notice: "Pasted from clipboard",
      clipboard_err: "Clipboard permission needed or empty",
      placeholder:
        "Paste the complete offer message, email text, WhatsApp forward, or onboarding communication here (minimum 25 characters)...",
      characters: "characters",
      min_chars: "(min 25)",
      scenario_active: "Scenario active",
      scenario_eyebrow: "OR TEST WITH REALISTIC SCENARIOS:",
      submit_btn: "Check offer",
      analyzing_btn: "Analyzing offer...",
      instant_check: "Instant local check",
      err_min_chars: "Please paste at least 25 characters of the offer message to run an audit.",
      err_generic: "Unable to analyze offer. Please try again.",
      scenarios: {
        techcorp_name: "Fake TechCorp Internship (Deposit Trap)",
        scholarship_name: "Scholarship Grant KYC Trap",
        genuine_name: "Genuine Enterprise Invite (Clean)",
      },
    },
    audit: {
      eyebrow: "AUDIT METHODOLOGY",
      title: "How Jaanch audits an offer in three steps.",
      subtitle:
        "A transparent rule-based evaluation model calibrated to common student recruitment scam vectors and verified hiring standards.",
      phase_prefix: "PHASE",
      step1_num: "01",
      step1_title: "Input & Ingestion",
      step1_summary: "Text paste, messaging apps (WhatsApp, Telegram, LinkedIn), or OCR screenshot upload.",
      step1_details:
        "Text is extracted safely inside your browser session. Contact identifiers and sensitive identity markers are redacted before contextual evaluation.",
      step2_num: "02",
      step2_title: "Pattern & Domain Verification",
      step2_summary: "Cross-checking upfront fees, free email domains, and official communication standards.",
      step2_details:
        "An 8-point deterministic rule engine inspects suspicious keywords, lookalike URLs (e.g. tcs-careers.org vs tcs.com), and coercive 2-hour deadline tactics.",
      step3_num: "03",
      step3_title: "Risk Assessment & Next Steps",
      step3_summary: "Risk classification, cited evidence phrases, and reporting options.",
      step3_details:
        "Receive a transparent verdict citing exact flagged quotes, verified MCA and AICTE registry links, and direct escalation to the 1930 Cyber Helpline.",
    },
    guidelines: {
      guide_eyebrow: "STATUTORY PROTECTIONS",
      guide_title: "Recruitment Integrity Guidelines",
      guide_sub: "Legitimate hiring standards and student protections",
      guide_p1_prefix:
        "Under advisory notices issued by the Ministry of Labour & Employment and Ministry of Corporate Affairs, ",
      guide_p1_strong:
        "no legitimate employer or recruiting agency is permitted to charge candidates application fees, security deposits, seat reservation charges, or documentation processing fees.",
      guide_p2:
        "Any demand for upfront payment via UPI, gift cards, or crypto — even if promised as \"100% refundable\" — is an immediate disqualifier and standard hallmark of student employment scams.",
      helpline_eyebrow: "SUSPECT FRAUD OR LOST FUNDS?",
      helpline_title: "National Cyber Crime Reporting Helpline: Dial 1930",
      helpline_desc:
        "If you transferred money or shared bank details with a fraudulent recruiter, dial 1930 immediately to register a formal complaint with state cyber cells before UPI transactions clear.",
      call_btn: "Call 1930",
    },
    footer: {
      tagline:
        "An independent, student-first verification utility. Check job, internship, and scholarship offers before sharing fees or private data.",
      helpline_label: "National Cyber Crime Helpline: ",
      edu_title: "EDUCATIONAL GUIDANCE",
      edu_desc:
        "Jaanch is a non-commercial educational decision support tool. It highlights common warning signs and guides students to independently verify hiring credentials on government databases.",
      edu_link1: "Student Verification Guide",
      edu_link2: "Audit Methodology & Facts",
      privacy_title: "LOCAL PRIVACY ARCHITECTURE",
      privacy_desc:
        "Files and uploaded screenshots are read locally in your browser using client-side WebAssembly. Personal documents and unconsented contact information are never permanently retained on any server.",
      privacy_link: "Plain-Language Privacy Policy",
      copyright: "© 2026 Jaanch Student Safety Initiative.",
      feedback: "Feedback",
      select_lang: "Select language:",
      lang_en: "English",
      lang_hi: "हिंदी",
      lang_kn: "ಕನ್ನಡ",
    },
  },
  hi: {
    nav: {
      brand_sub: "ऑफ़र सत्यापन",
      how_it_works: "यह कैसे काम करता है",
      coverage_facts: "कवरेज और तथ्य",
      verification_guide: "सत्यापन गाइड",
      helpline_nav: "हेल्पलाइन 1930",
      sign_in: "लॉग इन",
      check_offer: "ऑफ़र जाँचें",
      my_history: "मेरा इतिहास",
      settings: "सेटिंग्स",
      sign_out: "लॉग आउट",
      log_in: "लॉग इन",
      sign_up: "साइन अप",
    },
    hero: {
      eyebrow: "छात्रों के लिए स्वतंत्र सत्यापन",
      title_p1: "सच्चाई जानें,",
      title_accent: "जवाब देने से पहले।",
      subtitle:
        "भारतीय छात्रों के लिए एक मुफ़्त साधन जो पैसे या दस्तावेज़ साझा करने से पहले नौकरी, इंटर्नशिप और प्रशिक्षण ऑफ़र की जाँच करता है।",
      cta_check: "ऑफ़र जाँचें",
      cta_sample: "नमूना रिपोर्ट देखें",
      feature1_num: "01",
      feature1_title: "शुरू करने के लिए शुल्क न दें",
      feature1_desc: "वास्तविक इंटर्नशिप कभी भी शुल्क, सुरक्षा जमा या किट शुल्क नहीं मांगती हैं।",
      feature2_num: "02",
      feature2_title: "प्रेषक की जाँच करें",
      feature2_desc: "मुफ़्त ईमेल आईडी, मिलते-जुलते लिंक और आधिकारिक कॉर्पोरेट सीआईएन सत्यापित करें।",
      feature3_num: "03",
      feature3_title: "सत्यापित करें, फिर जवाब दें",
      feature3_desc: "शर्तें स्वीकार करने से पहले 8 सत्यापित छात्र सुरक्षा नियमों का पालन करें।",
      portals_eyebrow: "सत्यापित माध्यम",
      portals_title: "आधिकारिक पोर्टल हमेशा 100% मुफ़्त होते हैं।",
      portal1_name: "पीएम इंटर्नशिप योजना (कॉर्पोरेट मामलों का मंत्रालय)",
      portal2_name: "नेशनल करियर सर्विस (श्रम मंत्रालय)",
      portal3_name: "राष्ट्रीय छात्रवृत्ति पोर्टल (NSP)",
      portals_footer: "संदर्भ: आधिकारिक सरकारी पोर्टल • शून्य आवेदन शुल्क",
    },
    matrix: {
      col1_eyebrow: "शामिल ऑफ़र के प्रकार",
      col1_title: "व्यापक कवरेज",
      col1_desc: "प्लेसमेंट, इंटर्नशिप, फ्रीलांस",
      col2_eyebrow: "क्षेत्रीय भाषाएँ",
      col2_title: "अंग्रेजी और 12 भारतीय लिपियाँ",
      col2_desc: "अंग्रेजी, हिंदी, तमिल, तेलुगु, मराठी, बंगाली, कन्नड़ आदि।",
      col3_eyebrow: "खुली पहुंच",
      col3_title: "100% मुफ़्त और स्वतंत्र",
      col3_desc: "कोई शुल्क नहीं, शून्य डेटा ट्रैकिंग",
      col4_eyebrow: "आधिकारिक रिपोर्टिंग",
      col4_title: "राष्ट्रीय हेल्पलाइन 1930",
      col4_desc: "साइबर अपराध पोर्टल पर सीधा संदर्भ",
    },
    submission: {
      title: "सत्यापन के लिए ऑफ़र विवरण सबमिट करें।",
      subtitle:
        "आपके ब्राउज़र में स्थानीय रूप से विश्लेषण किया गया। व्यक्तिगत संपर्क विवरण और दस्तावेज़ कभी भी किसी सर्वर पर नहीं भेजे या संग्रहीत किए जाते हैं।",
      tab_paste: "ऑफ़र टेक्स्ट पेस्ट करें",
      tab_upload: "स्क्रीनशॉट अपलोड करें",
      action_paste: "क्लिपबोर्ड से पेस्ट करें",
      pasted_notice: "क्लिपबोर्ड से पेस्ट किया गया",
      clipboard_err: "क्लिपबोर्ड अनुमति आवश्यक है या खाली है",
      placeholder:
        "पूरा ऑफ़र संदेश, ईमेल टेक्स्ट, व्हाट्सएप फ़ॉरवर्ड, या ऑनबोर्डिंग संदेश यहाँ पेस्ट करें (कम से कम 25 अक्षर)...",
      characters: "अक्षर",
      min_chars: "(न्यूनतम 25)",
      scenario_active: "परिदृश्य सक्रिय",
      scenario_eyebrow: "या वास्तविक परिदृश्यों के साथ परीक्षण करें:",
      submit_btn: "ऑफ़र जाँचें",
      analyzing_btn: "ऑफ़र का विश्लेषण किया जा रहा है...",
      instant_check: "त्वरित स्थानीय जाँच",
      err_min_chars: "ऑडिट चलाने के लिए कृपया ऑफ़र संदेश के कम से कम 25 अक्षर पेस्ट करें।",
      err_generic: "ऑफ़र का विश्लेषण करने में असमर्थ। कृपया पुनः प्रयास करें।",
      scenarios: {
        techcorp_name: "नकली टेककॉर्प इंटर्नशिप (जमा जाल)",
        scholarship_name: "छात्रवृत्ति अनुदान केवाईसी जाल",
        genuine_name: "वास्तविक कॉर्पोरेट आमंत्रण (स्वच्छ)",
      },
    },
    audit: {
      eyebrow: "ऑडिट कार्यप्रणाली",
      title: "जाँच तीन चरणों में किसी ऑफ़र का ऑडिट कैसे करता है।",
      subtitle:
        "सामान्य छात्र भर्ती घोटालों और सत्यापित भर्ती मानकों के अनुसार कैलिब्रेट किया गया पारदर्शी नियम-आधारित मूल्यांकन मॉडल।",
      phase_prefix: "चरण",
      step1_num: "01",
      step1_title: "इनपुट और निष्कर्षण",
      step1_summary: "टेक्स्ट पेस्ट, मैसेजिंग ऐप (व्हाट्सएप, टेलीग्राम, लिंक्डइन), या ओसीआर स्क्रीनशॉट अपलोड।",
      step1_details:
        "टेक्स्ट आपके ब्राउज़र सत्र के अंदर सुरक्षित रूप से निकाला जाता है। प्रासंगिक मूल्यांकन से पहले संपर्क पहचानकर्ता और संवेदनशील पहचान चिह्नों को हटा दिया जाता है।",
      step2_num: "02",
      step2_title: "पैटर्न और डोमेन सत्यापन",
      step2_summary: "अग्रिम शुल्क, मुफ़्त ईमेल डोमेन और आधिकारिक संचार मानकों की जाँच।",
      step2_details:
        "एक 8-बिंदु नियम इंजन संदिग्ध कीवर्ड, मिलते-जुलते यूआरएल (उदा. tcs-careers.org बनाम tcs.com) और 2 घंटे की समय सीमा की रणनीति की जाँच करता है।",
      step3_num: "03",
      step3_title: "जोखिम मूल्यांकन और अगले कदम",
      step3_summary: "जोखिम वर्गीकरण, उद्धृत साक्ष्य वाक्यांश और रिपोर्टिंग विकल्प।",
      step3_details:
        "सटीक उद्धरण, सत्यापित एमसीए और एआईसीटीई रजिस्ट्री लिंक और 1930 साइबर हेल्पलाइन का सीधा संदर्भ प्राप्त करें।",
    },
    guidelines: {
      guide_eyebrow: "वैधानिक संरक्षण",
      guide_title: "भर्ती सत्यनिष्ठा दिशानिर्देश",
      guide_sub: "वैध भर्ती मानक और छात्र संरक्षण",
      guide_p1_prefix:
        "श्रम और रोजगार मंत्रालय और कॉर्पोरेट मामलों के मंत्रालय द्वारा जारी परामर्श सूचनाओं के तहत, ",
      guide_p1_strong:
        "किसी भी वैध नियोक्ता या भर्ती एजेंसी को उम्मीदवारों से आवेदन शुल्क, सुरक्षा जमा, सीट आरक्षण शुल्क या दस्तावेज़ीकरण प्रसंस्करण शुल्क लेने की अनुमति नहीं है।",
      guide_p2:
        "यूपीआई, उपहार कार्ड, या क्रिप्टो के माध्यम से अग्रिम भुगतान की कोई भी मांग - भले ही \"100% वापसी योग्य\" का वादा किया गया हो - छात्र रोजगार घोटालों की मानक पहचान है।",
      helpline_eyebrow: "धोखाधड़ी का संदेह है या पैसे खो दिए?",
      helpline_title: "राष्ट्रीय साइबर अपराध रिपोर्टिंग हेल्पलाइन: 1930 डायल करें",
      helpline_desc:
        "यदि आपने पैसे ट्रांसफर किए हैं या किसी धोखाधड़ी करने वाले भर्तीकर्ता के साथ बैंक विवरण साझा किए हैं, तो यूपीआई लेनदेन पूरा होने से पहले राज्य साइबर सेल में औपचारिक शिकायत दर्ज करने के लिए तुरंत 1930 डायल करें।",
      call_btn: "1930 पर कॉल करें",
    },
    footer: {
      tagline:
        "छात्रों के लिए एक स्वतंत्र सत्यापन उपयोगिता। शुल्क या निजी डेटा साझा करने से पहले नौकरी, इंटर्नशिप और छात्रवृत्ति ऑफ़र की जाँच करें।",
      helpline_label: "राष्ट्रीय साइबर अपराध हेल्पलाइन: ",
      edu_title: "शैक्षिक मार्गदर्शन",
      edu_desc:
        "जाँच एक गैर-व्यावसायिक शैक्षिक निर्णय समर्थन उपकरण है। यह सामान्य चेतावनी संकेतों को उजागर करता है और छात्रों को सरकारी डेटाबेस पर भर्ती साख को स्वतंत्र रूप से सत्यापित करने के लिए मार्गदर्शन करता है।",
      edu_link1: "छात्र सत्यापन गाइड",
      edu_link2: "ऑडिट कार्यप्रणाली और तथ्य",
      privacy_title: "स्थानीय गोपनीयता वास्तुकला",
      privacy_desc:
        "फ़ाइलें और अपलोड किए गए स्क्रीनशॉट आपके ब्राउज़र में क्लाइंट-साइड वेबअसेंबली का उपयोग करके स्थानीय रूप से पढ़े जाते हैं। व्यक्तिगत दस्तावेज़ और संपर्क जानकारी कभी भी किसी सर्वर पर स्थायी रूप से नहीं रखी जाती है।",
      privacy_link: "सरल भाषा गोपनीयता नीति",
      copyright: "© 2026 जाँच छात्र सुरक्षा पहल।",
      feedback: "प्रतिक्रिया",
      select_lang: "भाषा चुनें:",
      lang_en: "English",
      lang_hi: "हिंदी",
      lang_kn: "ಕನ್ನಡ",
    },
  },
  kn: {
    nav: {
      brand_sub: "ಆಫರ್ ಪರಿಶೀಲನೆ",
      how_it_works: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
      coverage_facts: "ವ್ಯಾಪ್ತಿ ಮತ್ತು ಸತ್ಯಗಳು",
      verification_guide: "ಪರಿಶೀಲನಾ ಮಾರ್ಗದರ್ಶಿ",
      helpline_nav: "ಸಹಾಯವಾಣಿ 1930",
      sign_in: "ಸೈನ್ ಇನ್",
      check_offer: "ಆಫರ್ ಪರಿಶೀಲಿಸಿ",
      my_history: "ನನ್ನ ಇತಿಹಾಸ",
      settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
      sign_out: "ಸೈನ್ ಔಟ್",
      log_in: "ಲಾಗ್ ಇನ್",
      sign_up: "ಸೈನ್ ಅಪ್",
    },
    hero: {
      eyebrow: "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಸ್ವತಂತ್ರ ಪರಿಶೀಲನೆ",
      title_p1: "ನಿಜವೆಂದು ತಿಳಿಯಿರಿ,",
      title_accent: "ಉತ್ತರಿಸುವ ಮುನ್ನ.",
      subtitle:
        "ಭಾರತೀಯ ವಿದ್ಯಾರ್ಥಿಗಳು ಹಣ ಅಥವಾ ದಾಖಲೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳುವ ಮೊದಲು ಉದ್ಯೋಗ, ಇಂಟರ್ನ್‌ಶಿಪ್ ಮತ್ತು ತರಬೇತಿ ಆಫರ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಸಹಾಯ ಮಾಡುವ ಉಚಿತ ಸಾಧನ.",
      cta_check: "ಆಫರ್ ಪರಿಶೀಲಿಸಿ",
      cta_sample: "ಮಾದರಿ ವರದಿ ವೀಕ್ಷಿಸಿ",
      feature1_num: "01",
      feature1_title: "ಪ್ರಾರಂಭಿಸಲು ಹಣ ಪಾವತಿಸಬೇಡಿ",
      feature1_desc: "ನಿಜವಾದ ಇಂಟರ್ನ್‌ಶಿಪ್‌ಗಳು ಎಂದಿಗೂ ಶುಲ್ಕ, ಠೇವಣಿ ಅಥವಾ ಕಿಟ್ ಶುಲ್ಕವನ್ನು ಕೇಳುವುದಿಲ್ಲ.",
      feature2_num: "02",
      feature2_title: "ಕಳುಹಿಸಿದವರನ್ನು ಪರಿಶೀಲಿಸಿ",
      feature2_desc: "ಉಚಿತ ಇಮೇಲ್ ಐಡಿಗಳು, ನಕಲಿ ಲಿಂಕ್‌ಗಳು ಮತ್ತು ಅಧಿಕೃತ ಕಾರ್ಪೊರೇಟ್ CIN ಪರಿಶೀಲಿಸಿ.",
      feature3_num: "03",
      feature3_title: "ಪರಿಶೀಲಿಸಿ, ನಂತರ ಉತ್ತರಿಸಿ",
      feature3_desc: "ನಿಯಮಗಳನ್ನು ಸ್ವೀಕರಿಸುವ ಮೊದಲು 8 ಪರಿಶೀಲಿಸಿದ ವಿದ್ಯಾರ್ಥಿ ಸುರಕ್ಷತಾ ನಿಯಮಗಳನ್ನು ಅನುಸರಿಸಿ.",
      portals_eyebrow: "ಪರಿಶೀಲಿಸಿದ ಚಾನೆಲ್‌ಗಳು",
      portals_title: "ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ಗಳು ಯಾವಾಗಲೂ 100% ಉಚಿತವಾಗಿರುತ್ತವೆ.",
      portal1_name: "ಪಿಎಂ ಇಂಟರ್ನ್‌ಶಿಪ್ ಯೋಜನೆ (ಕಾರ್ಪೊರೇಟ್ ವ್ಯವಹಾರಗಳ ಸಚಿವಾಲಯ)",
      portal2_name: "ನ್ಯಾಷನಲ್ ಕರಿಯರ್ ಸರ್ವಿಸ್ (ಕಾರ್ಮಿಕ ಸಚಿವಾಲಯ)",
      portal3_name: "ರಾಷ್ಟ್ರೀಯ ವಿದ್ಯಾರ್ಥಿವೇತನ ಪೋರ್ಟಲ್ (NSP)",
      portals_footer: "ಉಲ್ಲೇಖ: ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ಗಳು • ಶೂನ್ಯ ಅರ್ಜಿ ಶುಲ್ಕ",
    },
    matrix: {
      col1_eyebrow: "ಒಳಗೊಂಡಿರುವ ಆಫರ್ ಪ್ರಕಾರಗಳು",
      col1_title: "ಸಮಗ್ರ ವ್ಯಾಪ್ತಿ",
      col1_desc: "ಪ್ಲೇಸ್‌ಮೆಂಟ್‌ಗಳು, ಇಂಟರ್ನ್‌ಶಿಪ್‌ಗಳು, ಫ್ರೀಲ್ಯಾನ್ಸ್",
      col2_eyebrow: "ಪ್ರಾದೇಶಿಕ ಭಾಷೆಗಳು",
      col2_title: "ಇಂಗ್ಲಿಷ್ ಮತ್ತು 12 ಭಾರತೀಯ ಲಿಪಿಗಳು",
      col2_desc: "ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ, ತಮಿಳು, ತೆಲುಗು, ಮರಾಠಿ, ಬೆಂಗಾಲಿ, ಕನ್ನಡ ಇತ್ಯಾದಿ.",
      col3_eyebrow: "ಮುಕ್ತ ಪ್ರವೇಶ",
      col3_title: "100% ಉಚಿತ ಮತ್ತು ಸ್ವತಂತ್ರ",
      col3_desc: "ಯಾವುದೇ ಶುಲ್ಕವಿಲ್ಲ, ಶೂನ್ಯ ಡೇಟಾ ಟ್ರ್ಯಾಕಿಂಗ್",
      col4_eyebrow: "ಅಧಿಕೃತ ವರದಿ ಮಾಡುವಿಕೆ",
      col4_title: "ರಾಷ್ಟ್ರೀಯ ಸಹಾಯವಾಣಿ 1930",
      col4_desc: "ಸೈಬರ್ ಅಪರಾಧ ಪೋರ್ಟಲ್‌ಗೆ ನೇರ ಉಲ್ಲೇಖ",
    },
    submission: {
      title: "ಪರಿಶೀಲನೆಗಾಗಿ ಆಫರ್ ವಿವರಗಳನ್ನು ಸಲ್ಲಿಸಿ.",
      subtitle:
        "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸ್ಥಳೀಯವಾಗಿ ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ. ವೈಯಕ್ತಿಕ ಸಂಪರ್ಕ ವಿವರಗಳು ಮತ್ತು ದಾಖಲೆಗಳನ್ನು ಎಂದಿಗೂ ಯಾವುದೇ ಸರ್ವರ್‌ಗೆ ಕಳುಹಿಸಲಾಗುವುದಿಲ್ಲ ಅಥವಾ ಸಂಗ್ರಹಿಸಲಾಗುವುದಿಲ್ಲ.",
      tab_paste: "ಆಫರ್ ಪಠ್ಯ ಅಂಟಿಸಿ",
      tab_upload: "ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
      action_paste: "ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ನಿಂದ ಅಂಟಿಸಿ",
      pasted_notice: "ಕ್ಲಿಪ್‌ಬೋರ್ಡ್‌ನಿಂದ ಅಂಟಿಸಲಾಗಿದೆ",
      clipboard_err: "ಕ್ಲಿಪ್‌ಬೋರ್ಡ್ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ ಅಥವಾ ಖಾಲಿಯಾಗಿದೆ",
      placeholder:
        "ಸಂಪೂರ್ಣ ಆಫರ್ ಸಂದೇಶ, ಇಮೇಲ್ ಪಠ್ಯ, ವಾಟ್ಸಾಪ್ ಫಾರ್ವರ್ಡ್ ಅಥವಾ ಆನ್‌ಬೋರ್ಡಿಂಗ್ ಸಂದೇಶವನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ (ಕನಿಷ್ಠ 25 ಅಕ್ಷರಗಳು)...",
      characters: "ಅಕ್ಷರಗಳು",
      min_chars: "(ಕನಿಷ್ಠ 25)",
      scenario_active: "ಸನ್ನಿವೇಶ ಸಕ್ರಿಯವಾಗಿದೆ",
      scenario_eyebrow: "ಅಥವಾ ನೈಜ ಸನ್ನಿವೇಶಗಳೊಂದಿಗೆ ಪರೀಕ್ಷಿಸಿ:",
      submit_btn: "ಆಫರ್ ಪರಿಶೀಲಿಸಿ",
      analyzing_btn: "ಆಫರ್ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
      instant_check: "ತತ್ಕ್ಷಣದ ಸ್ಥಳೀಯ ತಪಾಸಣೆ",
      err_min_chars: "ಆಡಿಟ್ ನಡೆಸಲು ದಯವಿಟ್ಟು ಆಫರ್ ಸಂದೇಶದ ಕನಿಷ್ಠ 25 ಅಕ್ಷರಗಳನ್ನು ಅಂಟಿಸಿ.",
      err_generic: "ಆಫರ್ ವಿಶ್ಲೇಷಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      scenarios: {
        techcorp_name: "ನಕಲಿ ಟೆಕ್‌ಕಾರ್ಪ್ ಇಂಟರ್ನ್‌ಶಿಪ್ (ಠೇವಣಿ ಬಲೆ)",
        scholarship_name: "ವಿದ್ಯಾರ್ಥಿವೇತನ ಅನುದಾನ ಕೆವೈಸಿ ಬಲೆ",
        genuine_name: "ಅಧಿಕೃತ ಕಾರ್ಪೊರೇಟ್ ಆಹ್ವಾನ (ನೈಜ)",
      },
    },
    audit: {
      eyebrow: "ಆಡಿಟ್ ವಿಧಾನ",
      title: "ಜಾಂಚ್ ಮೂರು ಹಂತಗಳಲ್ಲಿ ಆಫರ್ ಅನ್ನು ಹೇಗೆ ಆಡಿಟ್ ಮಾಡುತ್ತದೆ.",
      subtitle:
        "ಸಾಮಾನ್ಯ ವಿದ್ಯಾರ್ಥಿ ನೇಮಕಾತಿ ವಂಚನೆಗಳು ಮತ್ತು ಪರಿಶೀಲಿಸಿದ ನೇಮಕಾತಿ ಮಾನದಂಡಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ಪಾರದರ್ಶಕ ನಿಯಮ-ಆಧಾರಿತ ಮೌಲ್ಯಮಾಪನ ಮಾದರಿ.",
      phase_prefix: "ಹಂತ",
      step1_num: "01",
      step1_title: "ಇನ್‌ಪುಟ್ ಮತ್ತು ಸ್ವೀಕಾರ",
      step1_summary: "ಪಠ್ಯ ಅಂಟಿಸುವಿಕೆ, ಮೆಸೇಜಿಂಗ್ ಆ್ಯಪ್‌ಗಳು (ವಾಟ್ಸಾಪ್, ಟೆಲಿಗ್ರಾಮ್, ಲಿಂಕ್ಡ್‌ಇನ್), ಅಥವಾ OCR ಸ್ಕ್ರೀನ್‌ಶಾಟ್ ಅಪ್‌ಲೋಡ್.",
      step1_details:
        "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಸೆಷನ್‌ನಲ್ಲಿ ಪಠ್ಯವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಹೊರತೆಗೆಯಲಾಗುತ್ತದೆ. ಸಂದರ್ಭೋಚಿತ ಮೌಲ್ಯಮಾಪನದ ಮೊದಲು ಸಂಪರ್ಕ ಗುರುತಿಸುವಿಕೆಗಳು ಮತ್ತು ಸೂಕ್ಷ್ಮ ಗುರುತಿನ ವಿವರಗಳನ್ನು ಮರೆಮಾಡಲಾಗುತ್ತದೆ.",
      step2_num: "02",
      step2_title: "ಮಾದರಿ ಮತ್ತು ಡೊಮೇನ್ ಪರಿಶೀಲನೆ",
      step2_summary: "ಮುಂಗಡ ಶುಲ್ಕಗಳು, ಉಚಿತ ಇಮೇಲ್ ಡೊಮೇನ್‌ಗಳು ಮತ್ತು ಅಧಿಕೃತ ಸಂವಹನ ಮಾನದಂಡಗಳ ಪರಿಶೀಲನೆ.",
      step2_details:
        "8-ಪಾಯಿಂಟ್ ನಿಯಮ ಎಂಜಿನ್ ಅನುಮಾನಾಸ್ಪದ ಕೀವರ್ಡ್‌ಗಳು, ನಕಲಿ URL ಗಳು (ಉದಾ: tcs-careers.org vs tcs.com) ಮತ್ತು 2-ಗಂಟೆಗಳ ಡೆಡ್‌ಲೈನ್ ಒತ್ತಡದ ತಂತ್ರಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತದೆ.",
      step3_num: "03",
      step3_title: "ಅಪಾಯ ಮೌಲ್ಯಮಾಪನ ಮತ್ತು ಮುಂದಿನ ಹಂತಗಳು",
      step3_summary: "ಅಪಾಯ ವರ್ಗೀಕರಣ, ಉಲ್ಲೇಖಿಸಲಾದ ಪುರಾವೆ ನುಡಿಗಟ್ಟುಗಳು ಮತ್ತು ವರದಿ ಮಾಡುವ ಆಯ್ಕೆಗಳು.",
      step3_details:
        "ಫ್ಲ್ಯಾಗ್ ಮಾಡಲಾದ ನಿಖರ ಉಲ್ಲೇಖಗಳು, ಪರಿಶೀಲಿಸಿದ MCA ಮತ್ತು AICTE ನೋಂದಣಿ ಲಿಂಕ್‌ಗಳು ಮತ್ತು 1930 ಸೈಬರ್ ಸಹಾಯವಾಣಿಗೆ ನೇರ ಉಲ್ಲೇಖವನ್ನು ಪಡೆಯಿರಿ.",
    },
    guidelines: {
      guide_eyebrow: "ಶಾಸನಬದ್ಧ ರಕ್ಷಣೆಗಳು",
      guide_title: "ನೇಮಕಾತಿ ಸಮಗ್ರತೆಯ ಮಾರ್ಗಸೂಚಿಗಳು",
      guide_sub: "ಕಾನೂನುಬದ್ಧ ನೇಮಕಾತಿ ಮಾನದಂಡಗಳು ಮತ್ತು ವಿದ್ಯಾರ್ಥಿ ರಕ್ಷಣೆಗಳು",
      guide_p1_prefix:
        "ಕಾರ್ಮಿಕ ಮತ್ತು ಉದ್ಯೋಗ ಸಚಿವಾಲಯ ಹಾಗೂ ಕಾರ್ಪೊರೇಟ್ ವ್ಯವಹಾರಗಳ ಸಚಿವಾಲಯ ನೀಡಿದ ಸಲಹಾ ಸೂಚನೆಗಳ ಅಡಿಯಲ್ಲಿ, ",
      guide_p1_strong:
        "ಯಾವುದೇ ಕಾನೂನುಬದ್ಧ ಉದ್ಯೋಗದಾತ ಅಥವಾ ನೇಮಕಾತಿ ಸಂಸ್ಥೆಯು ಅಭ್ಯರ್ಥಿಗಳಿಂದ ಅರ್ಜಿ ಶುಲ್ಕ, ಭದ್ರತಾ ಠೇವಣಿ, ಸೀಟು ಕಾಯ್ದಿರಿಸುವಿಕೆ ಶುಲ್ಕ ಅಥವಾ ದಾಖಲಾತಿ ಪ್ರಕ್ರಿಯೆ ಶುಲ್ಕವನ್ನು ವಿಧಿಸಲು ಅನುಮತಿಯಿಲ್ಲ.",
      guide_p2:
        "ಯುಪಿಐ, ಗಿಫ್ಟ್ ಕಾರ್ಡ್‌ಗಳು ಅಥವಾ ಕ್ರಿಪ್ಟೋ ಮೂಲಕ ಮುಂಗಡ ಪಾವತಿಯ ಯಾವುದೇ ಬೇಡಿಕೆಯು - \"100% ಮರುಪಾವತಿಸಬಹುದಾದ\" ಎಂದು ಭರವಸೆ ನೀಡಿದ್ದರೂ - ವಿದ್ಯಾರ್ಥಿ ಉದ್ಯೋಗ ವಂಚನೆಗಳ ಸ್ಪಷ್ಟ ಲಕ್ಷಣವಾಗಿದೆ.",
      helpline_eyebrow: "ವಂಚನೆಯ ಶಂಕೆ ಇದೆಯೇ ಅಥವಾ ಹಣ ಕಳೆದುಕೊಂಡಿದ್ದೀರಾ?",
      helpline_title: "ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಅಪರಾಧ ವರದಿ ಸಹಾಯವಾಣಿ: 1930 ಗೆ ಡಯಲ್ ಮಾಡಿ",
      helpline_desc:
        "ನೀವು ಹಣವನ್ನು ವರ್ಗಾಯಿಸಿದ್ದರೆ ಅಥವಾ ಮೋಸದ ನೇಮಕಾತಿದಾರರೊಂದಿಗೆ ಬ್ಯಾಂಕ್ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಂಡಿದ್ದರೆ, ಯುಪಿಐ ವಹಿವಾಟುಗಳು ಮುಗಿಯುವ ಮೊದಲು ರಾಜ್ಯ ಸೈಬರ್ ಕೋಶಗಳಲ್ಲಿ ದೂರು ದಾಖಲಿಸಲು ತಕ್ಷಣ 1930 ಗೆ ಕರೆ ಮಾಡಿ.",
      call_btn: "1930 ಗೆ ಕರೆ ಮಾಡಿ",
    },
    footer: {
      tagline:
        "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಒಂದು ಸ್ವತಂತ್ರ ಪರಿಶೀಲನಾ ಉಪಯುಕ್ತತೆ. ಶುಲ್ಕ ಅಥವಾ ಖಾಸಗಿ ಡೇಟಾವನ್ನು ಹಂಚಿಕೊಳ್ಳುವ ಮೊದಲು ಉದ್ಯೋಗ, ಇಂಟರ್ನ್‌ಶಿಪ್ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿವೇತನ ಆಫರ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
      helpline_label: "ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಅಪರಾಧ ಸಹಾಯವಾಣಿ: ",
      edu_title: "ಶೈಕ್ಷಣಿಕ ಮಾರ್ಗದರ್ಶನ",
      edu_desc:
        "ಜಾಂಚ್ ವಾಣಿಜ್ಯೇತರ ಶೈಕ್ಷಣಿಕ ನಿರ್ಧಾರ ಬೆಂಬಲ ಸಾಧನವಾಗಿದೆ. ಇದು ಸಾಮಾನ್ಯ ಎಚ್ಚರಿಕೆ ಚಿಹ್ನೆಗಳನ್ನು ಎತ್ತಿ ತೋರಿಸುತ್ತದೆ ಮತ್ತು ಸರ್ಕಾರಿ ಡೇಟಾಬೇಸ್‌ಗಳಲ್ಲಿ ನೇಮಕಾತಿ ರುಜುವಾತುಗಳನ್ನು ಸ್ವತಂತ್ರವಾಗಿ ಪರಿಶೀಲಿಸಲು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ.",
      edu_link1: "ವಿದ್ಯಾರ್ಥಿ ಪರಿಶೀಲನಾ ಮಾರ್ಗದರ್ಶಿ",
      edu_link2: "ಆಡಿಟ್ ವಿಧಾನ ಮತ್ತು ಸತ್ಯಗಳು",
      privacy_title: "ಸ್ಥಳೀಯ ಗೌಪ್ಯತೆ ರಚನೆ",
      privacy_desc:
        "ಕ್ಲೈಂಟ್-ಸೈಡ್ ವೆಬ್‌ಅಸೆಂಬ್ಲಿಯನ್ನು ಬಳಸಿಕೊಂಡು ಫೈಲ್‌ಗಳು ಮತ್ತು ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಸ್ಕ್ರೀನ್‌ಶಾಟ್‌ಗಳನ್ನು ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸ್ಥಳೀಯವಾಗಿ ಓದಲಾಗುತ್ತದೆ. ವೈಯಕ್ತಿಕ ದಾಖಲೆಗಳು ಮತ್ತು ಸಂಪರ್ಕ ಮಾಹಿತಿಯನ್ನು ಯಾವುದೇ ಸರ್ವರ್‌ನಲ್ಲಿ ಶಾಶ್ವತವಾಗಿ ಉಳಿಸಿಕೊಳ್ಳಲಾಗುವುದಿಲ್ಲ.",
      privacy_link: "ಸರಳ ಭಾಷೆಯ ಗೌಪ್ಯತಾ ನೀತಿ",
      copyright: "© 2026 ಜಾಂಚ್ ವಿದ್ಯಾರ್ಥಿ ಸುರಕ್ಷತಾ ಉಪಕ್ರಮ.",
      feedback: "ಪ್ರತಿಕ್ರಿಯೆ",
      select_lang: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:",
      lang_en: "English",
      lang_hi: "हिंदी",
      lang_kn: "ಕನ್ನಡ",
    },
  },
};
