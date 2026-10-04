document.addEventListener("DOMContentLoaded", function () {
 
    const input = document.getElementById("chat-input");
    const sendButton = document.getElementById("send-button");
    const chatWindow = document.getElementById("chatbot-window");
    const typingIndicator = document.getElementById("typing-indicator");
    const clearButton = document.getElementById("clear-chat");
 
 
    // ==========================================
    // EDUGUIDE KNOWLEDGE BASE
    //
    // Each topic has:
    //   keywords -> words the student might type
    //   answer   -> what EduGuide replies
    //
    // To teach the bot something new, just copy
    // one block and change the words.
    // ==========================================
 
    const knowledgeBase = [
 
        {
            keywords: ["hello", "hi", "hey", "molo", "sawubona", "dumela", "good morning", "good afternoon"],
            answer:
                "Hello! 👋 I'm EduGuide AI.\n\n" +
                "I can help you with:\n" +
                "• Universities in Gauteng\n" +
                "• TVET colleges\n" +
                "• Courses and what to study\n" +
                "• APS scores\n" +
                "• NSFAS and funding\n" +
                "• Application dates\n\n" +
                "What would you like to know?"
        },
 
        {
            keywords: ["university", "universities", "varsity", "uni"],
            answer:
                "Gauteng has 7 public universities:\n\n" +
                "🎓 University of the Witwatersrand (Wits) – Braamfontein, Johannesburg\n" +
                "🎓 University of Johannesburg (UJ) – Auckland Park, Doornfontein, Soweto\n" +
                "🎓 University of Pretoria (UP / Tuks) – Hatfield, Groenkloof, Mamelodi\n" +
                "🎓 University of South Africa (Unisa) – distance learning, study from home\n" +
                "🎓 Sefako Makgatho Health Sciences University (SMU) – Ga-Rankuwa\n" +
                "🎓 Tshwane University of Technology (TUT) – Pretoria and Soshanguve\n" +
                "🎓 Vaal University of Technology (VUT) – Vanderbijlpark\n\n" +
                "Ask me about any one of them for more detail."
        },
 
        {
            keywords: ["wits", "witwatersrand"],
            answer:
                "🎓 University of the Witwatersrand (Wits)\n\n" +
                "Where: Braamfontein, Johannesburg\n" +
                "Known for: Medicine, Engineering, Law, Accounting, Mining\n\n" +
                "Wits is research-focused and competitive. It uses its own admission score rather than the standard APS, and Mathematics (not Maths Literacy) is required for most science, engineering and commerce degrees.\n\n" +
                "Applications usually close at the end of September. Check wits.ac.za for this year's exact dates."
        },
 
        {
            keywords: ["uj", "johannesburg university", "university of johannesburg"],
            answer:
                "🎓 University of Johannesburg (UJ)\n\n" +
                "Campuses: Auckland Park Kingsway, Auckland Park Bunting Road, Doornfontein, Soweto\n" +
                "Known for: Engineering, IT, Education, Business, Art and Design\n\n" +
                "UJ offers both degrees and diplomas, so there are options at different APS levels. Applications usually close end of October.\n\n" +
                "Check uj.ac.za for this year's exact dates."
        },
 
        {
            keywords: ["up", "tuks", "pretoria university", "university of pretoria"],
            answer:
                "🎓 University of Pretoria (UP / Tuks)\n\n" +
                "Campuses: Hatfield, Groenkloof (Education), Prinshof (Health), Onderstepoort (Vet), Mamelodi\n" +
                "Known for: Veterinary Science, Engineering, Medicine, Law, Education\n\n" +
                "⚠️ Important: UP closes applications much earlier than other universities — usually 30 June for most programmes. Do not wait until matric finals.\n\n" +
                "Check up.ac.za for this year's exact dates."
        },
 
        {
            keywords: ["unisa", "distance", "correspondence", "study from home", "part time"],
            answer:
                "🎓 University of South Africa (Unisa)\n\n" +
                "Unisa is a distance-learning university, so you study from home. That makes it a good option if you are working, caring for family, or cannot move to a campus.\n\n" +
                "Things to know:\n" +
                "• Application windows are short and spaces are capped per qualification\n" +
                "• You need to be self-disciplined — nobody chases you to study\n" +
                "• Fees are generally lower than contact universities\n\n" +
                "Check unisa.ac.za for the current application window."
        },
 
        {
            keywords: ["tut", "tshwane university"],
            answer:
                "🎓 Tshwane University of Technology (TUT)\n\n" +
                "Campuses: Pretoria, Soshanguve, Ga-Rankuwa\n" +
                "Known for: Engineering, IT, Applied Sciences, Management\n\n" +
                "TUT is a university of technology, so qualifications are practical and career-focused. Many programmes include Work Integrated Learning (workplace experience) as part of the qualification.\n\n" +
                "Check tut.ac.za for application dates."
        },
 
        {
            keywords: ["vut", "vaal"],
            answer:
                "🎓 Vaal University of Technology (VUT)\n\n" +
                "Where: Vanderbijlpark, in the Vaal area of Gauteng\n" +
                "Known for: Engineering, IT, Human Sciences, Applied Sciences\n\n" +
                "VUT is a good option if you live in the southern parts of Gauteng and want a practical, hands-on qualification.\n\n" +
                "Check vut.ac.za for application dates."
        },
 
        {
            keywords: ["smu", "sefako", "makgatho", "health sciences university"],
            answer:
                "🎓 Sefako Makgatho Health Sciences University (SMU)\n\n" +
                "Where: Ga-Rankuwa, north of Pretoria\n" +
                "Focus: Health sciences only — Medicine, Dentistry, Pharmacy, Nursing, Physiotherapy, Occupational Therapy, Radiography\n\n" +
                "If you want to work in healthcare, SMU is worth applying to alongside Wits and UP.\n\n" +
                "Check smu.ac.za for application dates."
        },
 
        {
            keywords: ["tvet", "college", "colleges", "fet"],
            answer:
                "🏫 Public TVET colleges in Gauteng:\n\n" +
                "• Central Johannesburg TVET College\n" +
                "• Ekurhuleni East TVET College\n" +
                "• Ekurhuleni West TVET College\n" +
                "• Sedibeng TVET College\n" +
                "• South West Gauteng TVET College\n" +
                "• Tshwane North TVET College\n" +
                "• Tshwane South TVET College\n" +
                "• Western TVET College\n\n" +
                "TVET colleges teach practical trades and skills — electrical, plumbing, boilermaking, hospitality, office admin, engineering studies and more.\n\n" +
                "You can often start with Grade 9, and NSFAS covers TVET students too. It's a real career path, not a backup plan."
        },
 
        {
            keywords: ["aps", "points", "admission point", "score"],
            answer:
                "📊 APS = Admission Point Score\n\n" +
                "Most universities convert each matric mark into points:\n\n" +
                "80–100% = 7 points\n" +
                "70–79% = 6 points\n" +
                "60–69% = 5 points\n" +
                "50–59% = 4 points\n" +
                "40–49% = 3 points\n" +
                "30–39% = 2 points\n" +
                "0–29% = 1 point\n\n" +
                "Add your best 6 subjects, usually excluding Life Orientation.\n\n" +
                "⚠️ Wits and UP calculate their scores differently, and each course has its own minimum. Always check the specific course requirements."
        },
 
        {
            keywords: ["nsfas", "funding", "bursary", "bursaries", "money", "afford", "financial aid", "loan", "fees"],
            answer:
                "💰 NSFAS (National Student Financial Aid Scheme)\n\n" +
                "NSFAS funds students at public universities and TVET colleges. It can cover tuition, accommodation, transport, books and a living allowance.\n\n" +
                "Who usually qualifies:\n" +
                "• South African citizen\n" +
                "• Combined household income under R350 000 a year\n" +
                "• Under R600 000 a year if you have a disability\n" +
                "• SASSA grant recipients qualify automatically\n\n" +
                "Apply free at nsfas.org.za. Applications usually open around September.\n\n" +
                "Also look at Funza Lushaka (teaching), company bursaries like Eskom, Sasol and Transnet, and your university's own financial aid office."
        },
 
        {
            keywords: ["apply", "application", "deadline", "closing date", "when do i apply", "register"],
            answer:
                "📅 Applying, step by step:\n\n" +
                "1. Apply in Grade 12 — most windows open around April and close between June and October.\n" +
                "2. Apply to 3 or more institutions. Do not put everything on one application.\n" +
                "3. You'll usually need: ID copy, Grade 11 final results, Grade 12 term results, and proof of payment for the application fee.\n" +
                "4. Apply for NSFAS at the same time — don't wait for an acceptance letter.\n" +
                "5. Send your final matric results as soon as they're released.\n\n" +
                "⚠️ UP usually closes 30 June — the earliest in Gauteng. Always confirm dates on the institution's own website."
        },
 
        {
            keywords: ["engineering", "engineer"],
            answer:
                "⚙️ Studying Engineering\n\n" +
                "You will need Mathematics (not Maths Literacy) and Physical Sciences, usually 60% or higher.\n\n" +
                "Where to study in Gauteng:\n" +
                "• Wits, UP, UJ — BEng degrees (4 years)\n" +
                "• TUT, VUT, UJ — Engineering diplomas and BEngTech (more practical)\n\n" +
                "Fields include Civil, Mechanical, Electrical, Chemical, Industrial, Mining and Computer Engineering.\n\n" +
                "Tell me which field interests you and I'll explain what the work looks like."
        },
 
        {
            keywords: ["medicine", "doctor", "mbchb", "medical"],
            answer:
                "🩺 Studying Medicine (MBChB)\n\n" +
                "In Gauteng you can study medicine at Wits, UP and SMU.\n\n" +
                "You will need:\n" +
                "• Mathematics, Physical Sciences and Life Sciences — usually 70%+\n" +
                "• A very high overall score; places are extremely limited\n" +
                "• The NBT (National Benchmark Test) at most institutions\n\n" +
                "It takes 6 years, plus 2 years internship and 1 year community service.\n\n" +
                "If you don't get in, related paths include Pharmacy, Physiotherapy, Radiography, Nursing, Medical Science and Occupational Therapy — some students transfer into medicine later."
        },
 
        {
            keywords: ["teacher", "teaching", "education", "bed"],
            answer:
                "📚 Becoming a teacher\n\n" +
                "You study a BEd (4 years) or a degree plus a PGCE (1 year).\n\n" +
                "Where in Gauteng: UP (Groenkloof), Wits, UJ, Unisa\n\n" +
                "You choose a phase:\n" +
                "• Foundation Phase (Grade R–3)\n" +
                "• Intermediate Phase (Grade 4–6)\n" +
                "• Senior and FET Phase (Grade 7–12) — you pick subjects\n\n" +
                "💡 Look into the Funza Lushaka bursary. It covers the full cost of studying, and in return you teach at a public school for the same number of years it funded you."
        },
 
        {
            keywords: ["it", "computer", "programming", "coding", "software", "computer science", "developer"],
            answer:
                "💻 Studying IT and Computer Science\n\n" +
                "Options in Gauteng:\n" +
                "• BSc Computer Science — Wits, UP, UJ, Unisa (Maths required)\n" +
                "• BCom Informatics / Information Systems — UP, UJ\n" +
                "• Diploma in IT — TUT, VUT, UJ, TVET colleges\n\n" +
                "Degrees need Mathematics. Some diplomas accept Maths Literacy — check each one.\n\n" +
                "Careers: software developer, data analyst, cybersecurity, network engineer, systems analyst.\n\n" +
                "💡 You can start learning to code for free right now while you study — it counts for a lot in this field."
        },
 
        {
            keywords: ["law", "lawyer", "llb", "advocate", "attorney"],
            answer:
                "⚖️ Studying Law\n\n" +
                "The LLB takes 4 years straight after matric, or 2 years after a BA or BCom.\n\n" +
                "Where in Gauteng: Wits, UP, UJ, Unisa\n\n" +
                "You don't need Mathematics for most LLB programmes, but you do need strong English and a high overall score.\n\n" +
                "After the LLB you complete articles or pupillage and write board exams before you can practise."
        },
 
        {
            keywords: ["business", "bcom", "accounting", "commerce", "management", "finance", "marketing"],
            answer:
                "📈 Studying Business and Commerce\n\n" +
                "• BCom Accounting — the route to becoming a CA(SA). Needs strong Maths. Offered at Wits, UP, UJ, Unisa.\n" +
                "• BCom in Marketing, HR, Finance, Economics or Management — broader options\n" +
                "• Diplomas in Business Management, Marketing or Accounting — TUT, VUT, TVET colleges\n\n" +
                "Most BCom degrees require Mathematics. Maths Literacy usually limits you to diplomas, so check before you apply."
        },
 
        {
            keywords: ["nursing", "nurse"],
            answer:
                "👩‍⚕️ Studying Nursing\n\n" +
                "You can do a 4-year Bachelor of Nursing, or a shorter Diploma in Nursing.\n\n" +
                "Where in Gauteng: Wits, UJ, SMU, Unisa, and public nursing colleges such as Chris Hani Baragwanath and Ann Latsky.\n\n" +
                "You'll usually need Life Sciences, plus Maths or Maths Literacy depending on the institution.\n\n" +
                "Nursing is in high demand and nursing colleges often have separate, earlier application processes — apply to those directly too."
        },
 
        {
            keywords: ["maths literacy", "math literacy", "maths lit", "no maths", "don't have maths"],
            answer:
                "With Mathematical Literacy you can still study a lot — just not everything.\n\n" +
                "✅ Open to you: Law, Education, Social Work, Human Resources, Marketing, Public Management, Tourism, Hospitality, Journalism, Policing, many TVET programmes\n\n" +
                "❌ Usually closed: Engineering, Medicine, Computer Science, BCom Accounting, most BSc degrees\n\n" +
                "If you need Maths for your dream course, you can rewrite it through a second-chance matric programme or a bridging course at a TVET college or university."
        },
 
        {
            keywords: ["fail", "failed", "didn't pass", "did not pass", "rewrite", "supplementary", "bad marks", "low aps"],
            answer:
                "Not passing matric, or not getting the marks you wanted, is not the end of the road. Real options:\n\n" +
                "• Supplementary exams — rewrite the subjects you failed\n" +
                "• Second Chance Matric Programme — free, run by the Department of Basic Education\n" +
                "• TVET college — many programmes accept Grade 9 to Grade 11\n" +
                "• Bridging or foundation programmes at universities, which add a year and get you into the degree\n" +
                "• Learnerships and apprenticeships — you earn while you train\n\n" +
                "Plenty of people take a longer route and end up exactly where they wanted to be. Ask me about any of these."
        },
 
        {
            keywords: ["don't know", "dont know", "not sure", "what should i study", "confused", "undecided", "help me choose"],
            answer:
                "That's a normal place to be — most people don't know at 17.\n\n" +
                "Try working backwards from three things:\n\n" +
                "1. Which subjects do you actually enjoy sitting down with?\n" +
                "2. Do you prefer working with people, with your hands, with numbers, or with ideas?\n" +
                "3. What are your marks realistically letting you apply for?\n\n" +
                "Tell me your best subjects and I'll suggest some directions."
        },
 
        {
            keywords: ["thank", "thanks", "thank you", "enkosi", "dankie", "ngiyabonga"],
            answer: "You're welcome! Good luck with your applications. 🎓 Ask me anything else whenever you need to."
        },
 
        {
            keywords: ["bye", "goodbye", "see you", "later"],
            answer: "Goodbye! Come back any time you have questions about studying in Gauteng. 👋"
        },
 
        {
            keywords: ["who are you", "what are you", "what can you do", "help"],
            answer:
                "I'm EduGuide AI, a study guide for students in Gauteng.\n\n" +
                "Ask me about:\n" +
                "• Universities and TVET colleges in Gauteng\n" +
                "• Specific courses — engineering, medicine, teaching, IT, law, business, nursing\n" +
                "• How APS scores work\n" +
                "• NSFAS and bursaries\n" +
                "• Application steps and deadlines\n" +
                "• What to do if your marks are low\n\n" +
                "Just type your question in your own words."
        }
 
    ];
 
 
    // ==========================================
    // FIND THE BEST ANSWER
    // ==========================================
 
    function getAnswer(question) {
 
        const text = question.toLowerCase();
 
        let bestMatch = null;
        let bestScore = 0;
 
 
        // Check every topic and count how many keywords match
        for (let i = 0; i < knowledgeBase.length; i++) {
 
            const topic = knowledgeBase[i];
            let score = 0;
 
            for (let j = 0; j < topic.keywords.length; j++) {
 
                if (text.includes(topic.keywords[j])) {
 
                    // Longer keywords are more specific, so score them higher
                    score = score + topic.keywords[j].length;
 
                }
 
            }
 
            if (score > bestScore) {
 
                bestScore = score;
                bestMatch = topic;
 
            }
 
        }
 
 
        if (bestMatch !== null) {
 
            return bestMatch.answer;
 
        }
 
 
        // Nothing matched
        return (
            "I don't have an answer for that one yet.\n\n" +
            "Try asking me about:\n" +
            "• Universities or TVET colleges in Gauteng\n" +
            "• A course like engineering, teaching, IT or nursing\n" +
            "• APS scores\n" +
            "• NSFAS and bursaries\n" +
            "• Application deadlines"
        );
 
    }
 
 
    // ==========================================
    // SEND BUTTON
    // ==========================================
 
    sendButton.addEventListener("click", sendMessage);
 
 
    // ==========================================
    // ENTER KEY
    // ==========================================
 
    input.addEventListener("keydown", function (event) {
 
        if (event.key === "Enter") {
 
            sendMessage();
 
        }
 
    });
 
 
    // ==========================================
    // SEND MESSAGE
    // ==========================================
 
    function sendMessage() {
 
        const question = input.value.trim();
 
 
        // Don't send an empty message
        if (question === "") {
 
            return;
 
        }
 
 
        // Show user's message
        addUserMessage(question);
 
 
        // Clear input box
        input.value = "";
 
 
        // Show "thinking"
        typingIndicator.classList.remove("hidden");
 
 
        // Work out the answer
        const reply = getAnswer(question);
 
 
        // Small pause so it feels like the bot is thinking
        setTimeout(function () {
 
            typingIndicator.classList.add("hidden");
 
            addBotMessage(reply);
 
        }, 600);
 
    }
 
 
    // ==========================================
    // DISPLAY USER MESSAGE
    // ==========================================
 
    function addUserMessage(message) {
 
        const messageDiv = document.createElement("div");
 
        messageDiv.className = "user-message";
 
 
        messageDiv.innerHTML = `
 
            <div class="message-name">
                👤 You
            </div>
 
            <p>
                ${escapeHTML(message)}
            </p>
 
        `;
 
 
        chatWindow.appendChild(messageDiv);
 
 
        scrollChat();
 
    }
 
 
    // ==========================================
    // DISPLAY BOT MESSAGE
    // ==========================================
 
    function addBotMessage(message) {
 
        const messageDiv = document.createElement("div");
 
        messageDiv.className = "bot-message";
 
 
        messageDiv.innerHTML = `
 
            <div class="message-name">
                🤖 EduGuide AI
            </div>
 
            <p>
                ${formatMessage(message)}
            </p>
 
        `;
 
 
        chatWindow.appendChild(messageDiv);
 
 
        scrollChat();
 
    }
 
 
    // ==========================================
    // FORMAT BOT MESSAGE
    // ==========================================
 
    function formatMessage(message) {
 
        return escapeHTML(message)
            .replace(/\n/g, "<br>");
 
    }
 
 
    // ==========================================
    // SECURITY
    // ==========================================
 
    function escapeHTML(text) {
 
        const div = document.createElement("div");
 
        div.textContent = text;
 
        return div.innerHTML;
 
    }
 
 
    // ==========================================
    // SCROLL CHAT TO BOTTOM
    // ==========================================
 
    function scrollChat() {
 
        chatWindow.scrollTop = chatWindow.scrollHeight;
 
    }
 
 
    // ==========================================
    // CLEAR CHAT
    // ==========================================
 
    clearButton.addEventListener("click", function () {
 
        chatWindow.innerHTML = `
 
            <div class="bot-message">
 
                <div class="message-name">
                    🤖 EduGuide AI
                </div>
 
                <p>
                    Hello! 👋 I'm EduGuide AI.
                </p>
 
                <p>
                    How can I help you with universities,
                    colleges or courses in Gauteng?
                </p>
 
            </div>
 
        `;
 
    });
 
});