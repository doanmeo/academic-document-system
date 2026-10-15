package com.cntt.academicdocs.dto;

import java.util.List;
import java.util.Map;

public class CoverageMatrixDTO {
    private List<SubjectItem> subjects;
    private List<TypeItem> types;
    private Map<String, Integer> cellCounts; // key: subjectId + "_" + typeCode -> count
    private int totalApprovedDocuments;

    public static class SubjectItem {
        private Long id;
        private String code;
        private String name;

        public SubjectItem() {}

        public SubjectItem(Long id, String code, String name) {
            this.id = id;
            this.code = code;
            this.name = name;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class TypeItem {
        private String code;
        private String label;

        public TypeItem() {}

        public TypeItem(String code, String label) {
            this.code = code;
            this.label = label;
        }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
    }

    public CoverageMatrixDTO() {}

    public CoverageMatrixDTO(List<SubjectItem> subjects, List<TypeItem> types, Map<String, Integer> cellCounts, int totalApprovedDocuments) {
        this.subjects = subjects;
        this.types = types;
        this.cellCounts = cellCounts;
        this.totalApprovedDocuments = totalApprovedDocuments;
    }

    public List<SubjectItem> getSubjects() { return subjects; }
    public void setSubjects(List<SubjectItem> subjects) { this.subjects = subjects; }

    public List<TypeItem> getTypes() { return types; }
    public void setTypes(List<TypeItem> types) { this.types = types; }

    public Map<String, Integer> getCellCounts() { return cellCounts; }
    public void setCellCounts(Map<String, Integer> cellCounts) { this.cellCounts = cellCounts; }

    public int getTotalApprovedDocuments() { return totalApprovedDocuments; }
    public void setTotalApprovedDocuments(int totalApprovedDocuments) { this.totalApprovedDocuments = totalApprovedDocuments; }
}
