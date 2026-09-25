package com.cntt.academicdocs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;

/**
 * Main application class for Academic Document System backend.
 * Note: DataSourceAutoConfiguration and HibernateJpaAutoConfiguration are temporarily excluded
 * for the initial skeleton + health check milestone. They will be enabled in Task 2 (Entity User).
 */
@SpringBootApplication(exclude = {
        DataSourceAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class
})
public class AcademicDocsApplication {

    public static void main(String[] args) {
        SpringApplication.run(AcademicDocsApplication.class, args);
    }
}
