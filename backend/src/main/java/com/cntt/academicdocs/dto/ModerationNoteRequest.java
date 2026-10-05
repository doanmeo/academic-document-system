package com.cntt.academicdocs.dto;

public class ModerationNoteRequest {

    private String note;
    private String reason;

    public ModerationNoteRequest() {
    }

    public ModerationNoteRequest(String note) {
        this.note = note;
    }

    public String getNote() {
        return note != null ? note : reason;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
