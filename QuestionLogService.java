package com.eduguide;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class QuestionLogService {

    private final Path logFile =
            Path.of("data", "questions.csv");

    public QuestionLogService() {

        try {

            Files.createDirectories(
                    logFile.getParent()
            );

            if (Files.notExists(logFile)) {

                Files.writeString(
                        logFile,
                        "timestamp,question,matched_faq\n",
                        StandardCharsets.UTF_8,
                        StandardOpenOption.CREATE
                );
            }

        } catch (IOException e) {

            System.err.println(
                    "Could not create question log: "
                    + e.getMessage()
            );
        }
    }


    public synchronized void logQuestion(
            String question,
            String matchedFaq) {

        try {

            String timestamp =
                    LocalDateTime.now().format(
                            DateTimeFormatter.ISO_LOCAL_DATE_TIME
                    );

            String row =
                    csv(timestamp) + ","
                    + csv(question) + ","
                    + csv(matchedFaq) + "\n";

            Files.writeString(
                    logFile,
                    row,
                    StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.APPEND
            );

        } catch (IOException e) {

            System.err.println(
                    "Could not save question: "
                    + e.getMessage()
            );
        }
    }


    private String csv(String value) {

        if (value == null) {
            value = "";
        }

        return "\""
                + value.replace("\"", "\"\"")
                + "\"";
    }
}