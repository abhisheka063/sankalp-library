import { createContext, useContext, type ReactNode } from "react";

export type Language = "en" | "hi";

const hindi: Record<string, string> = {
  "Public site": "मुख्य पृष्ठ", "Admin dashboard": "प्रशासक डैशबोर्ड", "Register for membership": "सदस्यता के लिए पंजीकरण करें",
  "YOUR STUDY SPACE IN SIWAN": "सिवान में आपका अध्ययन स्थल", "निरंतर अध्ययन": "निरंतर अध्ययन", "निरंतर प्रगति": "निरंतर प्रगति",
  "शांत वातावरण · बेहतर सुविधा · उज्ज्वल भविष्य": "शांत वातावरण · बेहतर सुविधा · उज्ज्वल भविष्य", "STUDY WITH FOCUS": "एकाग्र होकर पढ़ें",
  "A space built for your preparation": "आपकी तैयारी के लिए एक बेहतर स्थान", "High-speed Wi-Fi": "हाई-स्पीड वाई-फ़ाई", "Comfortable study seating": "आरामदायक अध्ययन सीटें",
  "CCTV security": "सीसीटीवी सुरक्षा", "Proper lighting": "उचित रोशनी", "Clean drinking water": "स्वच्छ पेयजल", "AC / non-AC environment": "एसी / नॉन-एसी सुविधा",
  "Complete this short form. Fields marked * are required.": "यह छोटा फ़ॉर्म भरें। * वाले फ़ील्ड भरना अनिवार्य है।",
  "Complete this short form. Fields marked ": "यह छोटा फ़ॉर्म भरें। ", " are required.": " वाले फ़ील्ड भरना अनिवार्य है।",
  "From": "शुरुआती शुल्क", "per month": "प्रति माह", "Full name": "पूरा नाम", "Your full name": "अपना पूरा नाम लिखें", "Mobile number": "मोबाइल नंबर",
  "10-digit mobile number": "10 अंकों का मोबाइल नंबर", "We use this to contact you about your application.": "आपके आवेदन के बारे में संपर्क करने के लिए इसका उपयोग होगा।",
  "Full address": "पूरा पता", "Village / area, district, state": "गाँव / क्षेत्र, ज़िला, राज्य", "Date of birth (optional)": "जन्म तिथि (वैकल्पिक)",
  "You can leave this blank.": "आप इसे खाली छोड़ सकते हैं।", "Exam preparation category": "परीक्षा की तैयारी की श्रेणी", "Select exam category": "परीक्षा की श्रेणी चुनें",
  "Preferred study timing": "पढ़ाई का पसंदीदा समय", "Membership plan": "सदस्यता योजना", "Emergency contact (optional)": "आपातकालीन संपर्क (वैकल्पिक)",
  "Only used if there is an urgent issue while you are at the library.": "लाइब्रेरी में किसी आपात स्थिति में ही उपयोग किया जाएगा।", "Payment mode": "भुगतान का तरीका",
  "Cash at reception": "रिसेप्शन पर नकद", "Online payment": "ऑनलाइन भुगतान", "Online payment will be available soon. You can submit your application now and continue from the payment step.": "ऑनलाइन भुगतान जल्द उपलब्ध होगा। अभी आवेदन जमा करें; भुगतान सुविधा उपलब्ध होने पर आगे बढ़ें।",
  "Pay the selected plan amount at the library reception.": "चुनी गई योजना की राशि लाइब्रेरी रिसेप्शन पर जमा करें।", "I have read and agree to the membership terms.": "मैंने सदस्यता की शर्तें पढ़ ली हैं और उनसे सहमत हूँ।",
  "Submitting…": "जमा हो रहा है…", "Submit membership application": "सदस्यता आवेदन जमा करें", "Registration failed. Please try again.": "पंजीकरण नहीं हो सका। कृपया फिर से प्रयास करें।",
  "APPLICATION RECEIVED": "आवेदन प्राप्त हुआ", "Thank you for choosing Sankalp.": "संकल्प चुनने के लिए धन्यवाद।", "Your application is": "आपका आवेदन",
  "The library team will contact you at the mobile number you provided.": "लाइब्रेरी की टीम आपके दिए गए मोबाइल नंबर पर संपर्क करेगी।", "Amount due:": "देय राशि:",
  "Delete": "हटाएँ", "Delete application?": "आवेदन हटाएँ?", "Cancel": "रद्द करें", "This will permanently delete application": "यह आवेदन स्थायी रूप से हट जाएगा:", "Its generated PDF will also be deleted. This action cannot be undone.": "इसकी बनाई गई PDF भी हट जाएगी। यह कार्रवाई वापस नहीं की जा सकती।", "Could not delete application.": "आवेदन हटाया नहीं जा सका।",
  "Online payment is coming soon.": "ऑनलाइन भुगतान जल्द उपलब्ध होगा।", "Your application is saved. Please contact the library to complete payment, or use the payment link once it becomes available.": "आपका आवेदन सुरक्षित है। भुगतान पूरा करने के लिए लाइब्रेरी से संपर्क करें। ऑनलाइन भुगतान लिंक उपलब्ध होने पर उसका उपयोग करें।",
  "Payment mode:": "भुगतान का तरीका:", "Cash at reception.": "रिसेप्शन पर नकद।", "Pay": "जमा करें", "at the library reception.": "लाइब्रेरी रिसेप्शन पर।",
  "Keep this registration number for enquiries.": "पूछताछ के लिए यह पंजीकरण नंबर संभालकर रखें।", "Download your registration PDF": "पंजीकरण PDF डाउनलोड करें",
  "Unable to download the PDF.": "PDF डाउनलोड नहीं हो सकी।", "LIBRARY OPERATIONS": "लाइब्रेरी संचालन", "Applications": "आवेदन", "Log out": "लॉग आउट",
  "Total applications": "कुल आवेदन", "Pending": "लंबित", "Approved": "स्वीकृत", "Rejected": "अस्वीकृत", "Active memberships": "सक्रिय सदस्यताएँ",
  "Search applications": "आवेदन खोजें", "Name, mobile, or registration": "नाम, मोबाइल या पंजीकरण नंबर", "Export CSV": "CSV निर्यात करें",
  "Refresh applications": "आवेदन रीफ़्रेश करें", "Unable to load dashboard.": "डैशबोर्ड लोड नहीं हो सका।", "Could not update application.": "आवेदन अपडेट नहीं हो सका।",
  "Unable to export registrations.": "पंजीकरण सूची निर्यात नहीं हो सकी।", "Unable to download PDF.": "PDF डाउनलोड नहीं हो सकी।", "Registration": "पंजीकरण नंबर", "Name": "नाम", "Mobile": "मोबाइल",
  "Exam": "परीक्षा", "Status": "स्थिति", "Amount": "राशि", "Payment status": "भुगतान स्थिति", "Actions": "कार्रवाई", "No applications found.": "कोई आवेदन नहीं मिला।",
  "Administrator login": "प्रशासक लॉगिन", "Username": "यूज़रनेम", "Password": "पासवर्ड", "Log in": "लॉग इन करें", "Login failed.": "लॉगिन नहीं हो सका।",
  "Open navigation menu": "नेविगेशन मेन्यू खोलें", "Close": "बंद करें", "Close navigation menu": "नेविगेशन मेन्यू बंद करें", "Contact and directions": "संपर्क और दिशा-निर्देश", "Address, phone, and map": "पता, फ़ोन और नक्शा",
  "Admin": "प्रशासक", "Administrator dashboard": "प्रशासक डैशबोर्ड", "Visit or call us": "मिलें या कॉल करें", "CONTACT": "संपर्क", "Call": "कॉल करें",
  "Approximate map pin · Siwan, Bihar 841509": "अनुमानित स्थान · सिवान, बिहार 841509", "Map marker is an approximate city location and may not identify the library building.": "नक्शे पर स्थान अनुमानित है; यह लाइब्रेरी की सटीक इमारत नहीं भी हो सकती।",
  "Social media": "सोशल मीडिया", "Switch to light mode": "लाइट मोड चुनें", "Switch to dark mode": "डार्क मोड चुनें", "Switch language to Hindi": "भाषा हिंदी करें", "Switch language to English": "भाषा अंग्रेज़ी करें",
  "A steady space for focused preparation.": "एकाग्र तैयारी के लिए शांत स्थान।", "Quiet study. Clear goals. Consistent progress.": "शांत अध्ययन। स्पष्ट लक्ष्य। निरंतर प्रगति।",
  "Social links are placeholders until official profiles are added.": "आधिकारिक प्रोफ़ाइल जुड़ने तक ये सोशल लिंक उदाहरण के लिए हैं।", "EXPLORE": "जानकारी",
  "Membership registration": "सदस्यता पंजीकरण", "Administrator": "प्रशासक", "NEED HELP?": "सहायता चाहिए?", "Open the menu above for contact details, directions, and the approximate map pin.": "संपर्क विवरण, दिशा-निर्देश और अनुमानित नक्शा देखने के लिए ऊपर का मेन्यू खोलें।",
  "Call the library": "लाइब्रेरी को कॉल करें", "Membership subject to library rules and availability.": "सदस्यता लाइब्रेरी के नियमों और उपलब्धता के अधीन है।", "Library information is temporarily unavailable. Please refresh this page.": "लाइब्रेरी की जानकारी अभी उपलब्ध नहीं है। कृपया पेज रीफ़्रेश करें।",
  "Loading library information": "लाइब्रेरी की जानकारी लोड हो रही है", "Refresh": "रीफ़्रेश करें", "Export": "निर्यात करें", "PDF": "PDF", "Approve": "स्वीकृत करें", "Reject": "अस्वीकृत करें",
  "Morning": "सुबह", "Afternoon": "दोपहर", "Evening": "शाम", "Flexible": "कोई भी समय", "Please wait…": "कृपया प्रतीक्षा करें…",
  "Learn": "सीखें", "Prepare": "तैयारी करें", "Succeed": "सफल हों", "Cash": "नकद", "Online": "ऑनलाइन", "Paid": "भुगतान हुआ", "Unpaid": "भुगतान बाकी", "Due": "देय",
  "Railway": "रेलवे", "Banking": "बैंकिंग", "Bihar government exams": "बिहार सरकारी परीक्षाएँ", "Other": "अन्य", "Monthly": "मासिक",
  "I agree to follow library rules, maintain silence, and pay applicable membership fees.": "मैं लाइब्रेरी के नियमों का पालन करने, शांति बनाए रखने और लागू सदस्यता शुल्क जमा करने के लिए सहमत हूँ।",
  "I agree to follow library rules and membership terms.": "मैं लाइब्रेरी के नियमों और सदस्यता की शर्तों का पालन करने के लिए सहमत हूँ।",
  "Sankalp Library home": "संकल्प लाइब्रेरी का मुख्य पृष्ठ", "Student registration applications": "विद्यार्थी पंजीकरण आवेदन", "Approximate Sankalp Library location in Siwan, Bihar": "सिवान, बिहार में संकल्प लाइब्रेरी का अनुमानित स्थान",
  "Newari More, Tari Bazaar Road, Raghunathpur, Siwan, Bihar, India": "नेवारी मोड़, तारी बाज़ार रोड, रघुनाथपुर, सिवान, बिहार, भारत",
  "Social media links": "सोशल मीडिया लिंक", "Facebook demo link": "फ़ेसबुक उदाहरण लिंक", "Instagram demo link": "इंस्टाग्राम उदाहरण लिंक", "YouTube demo link": "यूट्यूब उदाहरण लिंक",
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({ language: "en", setLanguage: () => undefined, t: (text) => text });

export function LanguageProvider({ language, setLanguage, children }: { language: Language; setLanguage: (language: Language) => void; children: ReactNode }) {
  const t = (text: string) => language === "hi" ? (hindi[text] ?? text) : text;
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
