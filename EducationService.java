
package com.eduguide;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class EducationService {

    private final List<Faq> faqDatabase = new ArrayList<>();

    public EducationService() {
        loadFaqDatabase();
    }

    // =========================================
    // LOAD FAQ DATABASE
    // =========================================

    private void loadFaqDatabase() {

        try {
            ObjectMapper mapper = new ObjectMapper();

            ClassPathResource resource =
                    new ClassPathResource("faq.json");

            try (InputStream input =
                         resource.getInputStream()) {

                List<Faq> faqs = mapper.readValue(
                        input,
                        new TypeReference<List<Faq>>() {}
                );

                faqDatabase.addAll(faqs);
            }

            System.out.println(
                    "EduGuide FAQ database loaded: "
                    + faqDatabase.size()
                    + " FAQs"
            );

        } catch (Exception e) {

            System.err.println(
                    "Could not load FAQ database: "
                    + e.getMessage()
            );

        }
    }


    // =========================================
    // PROCESS USER QUESTION
    // =========================================

    public String getAnswer(String question) {

        if (question == null ||
                question.trim().isEmpty()) {

            return "Please enter a question about universities, "
                    + "colleges or courses in Gauteng.";
        }

        String userQuestion = normalize(question);

        Faq bestMatch = null;

        int highestScore = 0;


        // Search all FAQs
        for (Faq faq : faqDatabase) {

            int score = calculateScore(
                    userQuestion,
                    faq
            );

            if (score > highestScore) {

                highestScore = score;

                bestMatch = faq;
            }
        }


        // Return matched answer
        if (bestMatch != null &&
                highestScore >= 2) {

            System.out.println(
                    "Matched FAQ: "
                    + bestMatch.getId()
                    + " | Score: "
                    + highestScore
            );

            return bestMatch.getAnswer();
        }


        // No match found
        return "I'm EduGuide Gauteng! 🤖 "
                + "I couldn't find an exact answer to your question yet. "
                + "I can help with universities, TVET colleges, "
                + "IT courses, APS, applications, NSFAS and qualifications. "
                + "Try asking your question using a specific institution "
                + "or course name.";
    }


    // =========================================
    // MATCH USER QUESTION TO FAQ
    // =========================================

    private int calculateScore(
            String userQuestion,
            Faq faq) {

        int score = 0;


        // Exact question match
        if (faq.getQuestions() != null) {

            for (String question : faq.getQuestions()) {

                String normalizedFaqQuestion =
                        normalize(question);

                if (userQuestion.equals(
                        normalizedFaqQuestion)) {

                    return 100;
                }

                // Partial question match
                if (userQuestion.contains(
                        normalizedFaqQuestion) ||
                        normalizedFaqQuestion.contains(
                                userQuestion)) {

                    score += 4;
                }
            }
        }


        // Keyword matching
        if (faq.getKeywords() != null) {

            for (String keyword : faq.getKeywords()) {

                String normalizedKeyword =
                        normalize(keyword);

                if (normalizedKeyword.isEmpty()) {
                    continue;
                }

                if (userQuestion.contains(
                        normalizedKeyword)) {

                    // Give more weight to longer phrases
                    if (normalizedKeyword.contains(" ")) {
                        score += 4;
                    } else {
                        score += 2;
                    }
                }
            }
        }

        return score;
    }


    // =========================================
    // NORMALIZE TEXT
    // =========================================

    private String normalize(String text) {

        String normalized = Normalizer.normalize(
                text.toLowerCase(Locale.ROOT),
                Normalizer.Form.NFD
        );

        normalized = normalized.replaceAll(
                "\\p{M}", ""
        );

        normalized = normalized.replaceAll(
                "[^a-z0-9\\s]", " "
        );

        normalized = normalized.replaceAll(
                "\\s+", " "
        );

        return normalized.trim();
    }
    
}