package com.cntt.academicdocs.dto;

import java.util.List;

public class CourseHubDTO {
    private SubjectDTO subject;
    private int totalDocuments;
    private int totalLectures;
    private int totalLabs;
    private int totalProjects;
    private int totalExams;
    private List<DocumentSummaryDTO> lectures;
    private List<DocumentSummaryDTO> labs;
    private List<DocumentSummaryDTO> projects;
    private List<DocumentSummaryDTO> exams;
    private List<String> instructorAdvisors;

    public CourseHubDTO() {}

    public SubjectDTO getSubject() { return subject; }
    public void setSubject(SubjectDTO subject) { this.subject = subject; }

    public int getTotalDocuments() { return totalDocuments; }
    public void setTotalDocuments(int totalDocuments) { this.totalDocuments = totalDocuments; }

    public int getTotalLectures() { return totalLectures; }
    public void setTotalLectures(int totalLectures) { this.totalLectures = totalLectures; }

    public int getTotalLabs() { return totalLabs; }
    public void setTotalLabs(int totalLabs) { this.totalLabs = totalLabs; }

    public int getTotalProjects() { return totalProjects; }
    public void setTotalProjects(int totalProjects) { this.totalProjects = totalProjects; }

    public int getTotalExams() { return totalExams; }
    public void setTotalExams(int totalExams) { this.totalExams = totalExams; }

    public List<DocumentSummaryDTO> getLectures() { return lectures; }
    public void setLectures(List<DocumentSummaryDTO> lectures) { this.lectures = lectures; }

    public List<DocumentSummaryDTO> getLabs() { return labs; }
    public void setLabs(List<DocumentSummaryDTO> labs) { this.labs = labs; }

    public List<DocumentSummaryDTO> getProjects() { return projects; }
    public void setProjects(List<DocumentSummaryDTO> projects) { this.projects = projects; }

    public List<DocumentSummaryDTO> getExams() { return exams; }
    public void setExams(List<DocumentSummaryDTO> exams) { this.exams = exams; }

    public List<String> getInstructorAdvisors() { return instructorAdvisors; }
    public void setInstructorAdvisors(List<String> instructorAdvisors) { this.instructorAdvisors = instructorAdvisors; }
}
