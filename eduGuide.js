package com.eduguide;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EduGuideApplication {

    public static void main(String[] args) {

        SpringApplication.run(EduGuideApplication.class, args);

        System.out.println("EduGuide Gauteng Backend Started");
        System.out.println("http://localhost:8080");
    }
}