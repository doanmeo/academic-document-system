package com.cntt.academicdocs.dto;

import com.cntt.academicdocs.domain.LovValue;

public class LovValueDTO {
    private String code;
    private String label;
    private int displayOrder;

    public LovValueDTO() {}

    public LovValueDTO(String code, String label, int displayOrder) {
        this.code = code;
        this.label = label;
        this.displayOrder = displayOrder;
    }

    public static LovValueDTO fromEntity(LovValue val) {
        return new LovValueDTO(val.getCode(), val.getLabel(), val.getDisplayOrder());
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }
}
