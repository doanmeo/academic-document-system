package com.cntt.academicdocs.dto;

public class DocumentMemberDTO {
    private Long id;
    private Long userId;
    private String fullName;
    private String studentCode;
    private Integer memberOrder;
    private Boolean isLeader;

    public DocumentMemberDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getStudentCode() { return studentCode; }
    public void setStudentCode(String studentCode) { this.studentCode = studentCode; }

    public Integer getMemberOrder() { return memberOrder; }
    public void setMemberOrder(Integer memberOrder) { this.memberOrder = memberOrder; }

    public Boolean getIsLeader() { return isLeader; }
    public void setIsLeader(Boolean leader) { isLeader = leader; }
}
